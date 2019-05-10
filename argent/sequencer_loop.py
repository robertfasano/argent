from artiq.experiment import *
import numpy as np
import requests
from flask import Flask
from flask_socketio import SocketIO, emit
import logging
import pandas as pd
from artiq.coredevice.sampler import adc_mu_to_volt
import json
import pickle
import time

def prepare_data_sets(times, n_samples) -> TList(TList(TList(TInt32))):
    return [[[0]*8]*n_samples[i] for i in range(len(times))]

def get_ttls(ttl_channels, sequence=None) -> TList(TList(TInt32)):
    ''' Queries the EMERGENT API and receives a sequence of the format
            [{'name': 'step1', 'TTL': [0,1], 'ADC': [0]}]
        Prepares a TTL table from this sequence. '''
    if sequence is None:
        sequence = requests.get('http://127.0.0.1:5000/artiq/sequence').json()
    state = []
    for step in sequence:
        if 'TTL' not in step:
            step['TTL'] = []
        step_state = []
        for ch in ttl_channels:
            if ch in step['TTL'] or str(ch) in step['TTL']:
                step_state.append(1)
            else:
                step_state.append(0)
        state.append(step_state)
    state = list(map(list, zip(*state)))            # transpose

    return state

def get_dacs(dac_channels, sequence=None) -> TList(TList(TFloat)):
    ''' Queries the EMERGENT API and receives a sequence of the format
            [{'name': 'step1', 'TTL': [0,1], 'ADC': [0]}]
        Prepares a TTL table from this sequence. '''
    if sequence is None:
        sequence = requests.get('http://127.0.0.1:5000/artiq/sequence').json()
    state = []
    for step in sequence:
        if 'DAC' not in step:
            step['DAC'] = []
        step_state = []
        for ch in dac_channels:
            index = None
            if ch in step['DAC']:
                value = float(step['DAC'][ch])
            elif str(ch) in step['DAC']:
                value = float(step['DAC'][str(ch)])
            else:
                value = 0.0
            step_state.append(value)
        state.append(step_state)

    return state

def get_adcs(adc_channels, sequence=None) -> TList(TList(TInt32)):
    ''' Queries the EMERGENT API and receives a sequence of the format
            [{'name': 'step1', 'TTL': [0,1], 'ADC': [0]}]
        Prepares an ADC table from this sequence. '''
    if sequence is None:
        sequence = requests.get('http://127.0.0.1:5000/artiq/sequence').json()
    state = []
    for step in sequence:
        step_state = []
        if 'ADC' not in step:
            step['ADC'] = []
        for ch in adc_channels:
            if ch in step['ADC'] or str(ch) in step['ADC']:
                step_state.append(1)
            else:
                step_state.append(0)
        state.append(step_state)

    return state

def get_timesteps(sequence=None) -> TList(TFloat):
    if sequence is None:
        run = requests.get('http://127.0.0.1:5000/artiq/sequence').json()
        sequence = run['sequence']

    times = []
    for step in sequence:
        times.append(float(step['duration']))
    return times

class Sequencer(EnvExperiment):
    def build(self):
        self.setattr_device("core")
        self.setattr_device("scheduler")
        self.setattr_device("core_dma")

        self._ttls = []
        for i in range(16):
            self.setattr_device("ttl%i"%i)
            dev = getattr(self, "ttl%i"%i)
            self._ttls.append(dev)

        self.setattr_device('zotino0')          # 32 channel DAC
        self.setattr_device('sampler0')         # 8 channel ADC

        self.times = []
        self.ttl_channels = list(range(16))

        self.adc_channels = [0]
        self.dac_channels = [0]
        self.ttl_table = [[0]]
        self.adc_table = [[0]]
        self.dac_table = [[0.0]]
        self.data = [[[0]]]

    def prepare_attributes(self, sequence=None):
        # self.ttl_channels = list(8, range(16))
        # for step in sequence:
        #     for ch in step['TTL']:
        #         if int(ch) not in self.ttl_channels:
        #             self.ttl_channels.append(int(ch))
        # self.ttl_channels.sort()
        if sequence is None:
            # sequence = requests.get('http://127.0.0.1:5000/artiq/sequence').json()
            with open('sequence.json', 'r') as file:
                sequence = json.load(file)
            print(sequence)
        self.adc_channels = []
        for step in sequence:
            if 'ADC' not in step or step['ADC'] == []:
                step['ADC'] = [0]           # always measure on CH0 to ensure integer type in inner list level
            for ch in step['ADC']:
                if int(ch) not in self.adc_channels:
                    self.adc_channels.append(int(ch))
        self.adc_channels.sort()

        self.dac_channels = []
        for step in sequence:
            if 'DAC' not in step or step['DAC'] == {}:
                step['DAC'] = [0]
            for ch in step['DAC']:
                if int(ch) not in self.dac_channels:
                    self.dac_channels.append(int(ch))
        self.dac_channels.sort()

        self.ttl_table = get_ttls(list(range(16)), sequence)
        self.adc_table = get_adcs(self.adc_channels, sequence)
        self.dac_table = get_dacs(self.dac_channels, sequence)
        self.times = get_timesteps(sequence)



    def get_times(self) -> TList(TFloat):
        return self.times

    def get_ttl_table(self) -> TList(TList(TInt32)):
        return self.ttl_table

    def get_adc_table(self) -> TList(TList(TInt32)):
        print(self.adc_table)
        return self.adc_table

    def get_dac_table(self) -> TList(TList(TFloat)):
        return self.dac_table

    ''' Start management '''
    def process_submitted(self) -> TBool:
        return bool(self._submit_emergent)

    def reset_process(self):
        self._submit_emergent = 0
        self.do_adc = 0

    @kernel
    def initialize_kernel(self):
        self.core.reset()
        self.core.break_realtime()
        self.sampler0.init()
        self.core.break_realtime()
        self.zotino0.init()
        self.core.break_realtime()
        delay(1*ms)

    @kernel
    def slack(self):
        print(now_mu()-self.core.get_rtio_counter_mu())

    def get_N_samples(self, adc_delay) -> TList(TInt32):
        N_samples = []
        for t in self.times:
            N_samples.append(int(t/adc_delay))
        return N_samples

    @kernel
    def run(self):
        self.initialize_kernel()
        for ttl in self._ttls:
            ttl.output()
        self.prepare_attributes()
        self.times = self.get_times()
        self.ttl_table = self.get_ttl_table()
        self.adc_table = self.get_adc_table()
        self.dac_table = self.get_dac_table()
        print(self.times)
        print(self.ttl_table)
        print(self.adc_table)
        print(self.dac_table)
        adc_delay = 1*ms
        N_samples = self.get_N_samples(adc_delay)
        data = [[[0 for ch in range(8)] for n in range(N_samples[i])] for i in range(len(self.times))]
            ## NOTE: simplifying this declaration using pythonic syntax like
            ## [0 for ch in range(8)] -> [0]*8 can cause different list elements
            ## to share byte addresses, such that updating one will update all
        self.core.break_realtime()
        delay(1*ms)            # adjust as needed to avoid RTIO underflows

        while True:
            data = self.execute(self._ttls, adc_delay,  N_samples, data)


    @kernel
    def execute(self, ttls, adc_delay, N_samples, data):
        # self.core.break_realtime()
        col = 0
        for time in self.times:
            start_mu = now_mu()
            with parallel:

                ''' DAC '''
                with sequential:
                    row = 0
                    with parallel:
                        at_mu(start_mu)
                        voltages = self.dac_table[col]
                        self.zotino0.set_dac(voltages, self.dac_channels)
                        delay(time)
                ''' TTL '''
                with sequential:
                    channels2 = self.ttl_channels[0:8]
                    for ch in channels2:
                        at_mu(start_mu+2*ch)            # add 2 ns delay per channel to avoid collisions
                        if self.ttl_table[ch][col]==1:
                            # print(ch, 'on')
                            ttls[ch].on()
                            delay(time)
                        else:
                            # print(ch, 'off')
                            ttls[ch].off()
                            delay(time)

                    channels1 = self.ttl_channels[8:16]
                    for ch in channels1:
                        at_mu(start_mu+2+2*ch)          # add 2 ns + 2 ns/channel delay to avoid collisions
                        if self.ttl_table[ch][col]==1:
                            ttls[ch].on()
                            delay(time)
                        else:

                            ttls[ch].off()
                            delay(time)
                ''' ADC '''
                # if self.do_adc == 1:
                with sequential:
                    if 1 in self.adc_table[col]:
                        data = self.get_samples(col, N_samples[col], adc_delay, data)
                    else:
                        delay(time)
            col += 1
        return data

    @kernel
    def get_samples(self, step_number, n, dt, data):
        for i in range(n):
            with parallel:
                self.sampler0.sample_mu(data[step_number][i])
                delay(dt)
        return data

    @kernel
    def execute_ttl_pattern(self, ttls, channels, times, table):
        col=0
        for time in times:
            start_mu = now_mu()
            with parallel:
                row=0
                for ch in channels:
                    at_mu(start_mu)
                    if table[row][col]==1:
                        ttls[ch].on()
                        delay(time)
                    else:
                        ttls[ch].off()
                        delay(time)
                    row = row + 1
                col = col + 1

    @kernel
    def set_ttl_table(self, ttls, channels, times, table):
        with self.core_dma.record("table"):
            self.execute_ttl_pattern(ttls, channels, times, table)

    @kernel
    def TTL_playback(self, table):
        self.core_dma.playback_handle(table)
