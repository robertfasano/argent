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

class Sequencer(EnvExperiment):
    def build(self):
        self.setattr_device("core")
        self.setattr_device("scheduler")
        self.setattr_device("core_dma")
        self.setattr_device("urukul0_cpld")  #4 Channels of DDS
        self._dds = []
        for i in range(4):
            self.setattr_device('urukul0_ch{}'.format(i))
            dev = getattr(self, 'urukul0_ch{}'.format(i))
            self._dds.append(dev)
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
        self.dds_table = [[[0.0, 0.0]]]
        self.data = [[[0]]]

    def prepare_attributes(self):
        ''' Reads a sequence from file, then recasts into ARTIQ-friendly types
            (nested lists of ints and floats) which can be accessed in the kernel
            via RPC to the master. '''
        with open('sequence.json', 'r') as file:
            sequence = json.load(file)
        print(sequence)

        ''' Prepare ADC channels '''
        self.adc_channels = []
        for step in sequence:
            if 'ADC' not in step or step['ADC'] == []:
                step['ADC'] = [0]           # always measure on CH0 to ensure integer type in inner list level
            for ch in step['ADC']:
                if int(ch) not in self.adc_channels:
                    self.adc_channels.append(int(ch))
        self.adc_channels.sort()

        ''' Prepare DAC channels '''
        self.dac_channels = []
        for step in sequence:
            if 'DAC' not in step or step['DAC'] == {}:
                step['DAC'] = [0]
            for ch in step['DAC']:
                if int(ch) not in self.dac_channels:
                    self.dac_channels.append(int(ch))
        self.dac_channels.sort()


        ''' Form TTL table '''
        ttl_channels = list(range(16))
        self.ttl_table = []
        for step in sequence:
            if 'TTL' not in step:
                step['TTL'] = []
            step_state = []
            for ch in ttl_channels:
                if ch in step['TTL'] or str(ch) in step['TTL']:
                    step_state.append(1)
                else:
                    step_state.append(0)
            self.ttl_table.append(step_state)
        self.ttl_table = list(map(list, zip(*self.ttl_table)))            # transpose

        ''' Form DAC table '''
        self.dac_table = []
        for step in sequence:
            if 'DAC' not in step:
                step['DAC'] = []
            step_state = []
            for ch in self.dac_channels:
                index = None
                if ch in step['DAC']:
                    value = float(step['DAC'][ch])
                elif str(ch) in step['DAC']:
                    value = float(step['DAC'][str(ch)])
                else:
                    value = 0.0
                step_state.append(value)
            self.dac_table.append(step_state)


        ''' Form ADC table '''
        self.adc_table = []
        for step in sequence:
            step_state = []
            if 'ADC' not in step:
                step['ADC'] = []
            for ch in self.adc_channels:
                if ch in step['ADC'] or str(ch) in step['ADC']:
                    step_state.append(1)
                else:
                    step_state.append(0)
            self.adc_table.append(step_state)

        ''' Form DDS table '''
        self.dds_table = []
        for step in sequence:
            step_state = []
            for i in range(len(step['DDS'])):
                step_state.append([step['DDS'][i]['frequency'],step['DDS'][i]['attenuation']])


            self.dds_table.append(step_state)


        ''' Form delay list '''
        # self.times = []
        # for step in sequence:
        #     self.times.append(float(step['duration']))
        self.times = [float(step['duration']) for step in sequence]


    def get_times(self) -> TList(TFloat):
        return self.times

    def get_ttl_table(self) -> TList(TList(TInt32)):
        return self.ttl_table

    def get_dds_table(self) -> TList(TList(TList(TFloat))):
        return self.dds_table

    def get_adc_table(self) -> TList(TList(TInt32)):
        print(self.adc_table)
        return self.adc_table

    def get_dac_table(self) -> TList(TList(TFloat)):
        return self.dac_table

    @kernel
    def initialize_kernel(self):
        self.core.reset()
        self.core.break_realtime()
        self.sampler0.init()
        self.core.break_realtime()
        self.zotino0.init()
        self.core.break_realtime()
        self.urukul0_cpld.init()
        for i in range(4):
            self._dds[i].init()         # initialize channel
            self._dds[i].sw.on()        # open rf switch
        delay(10*ms)

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
        self.prepare_attributes()      # read a sequence from file and set attributes on the master
        self.times = self.get_times()
        self.ttl_table = self.get_ttl_table()
        self.adc_table = self.get_adc_table()
        self.dac_table = self.get_dac_table()
        self.dds_table = self.get_dds_table()
        print(self.times)
        print(self.ttl_table)
        print(self.adc_table)
        print(self.dac_table)
        print(self.dds_table)

        adc_delay = 1*ms
        N_samples = self.get_N_samples(adc_delay)
        data = [[[0 for ch in range(8)] for n in range(N_samples[i])] for i in range(len(self.times))]
            ## NOTE: simplifying this declaration using pythonic syntax like
            ## [0 for ch in range(8)] -> [0]*8 can cause different list elements
            ## to share byte addresses, such that updating one will update all
        self.core.break_realtime()
        delay(10*ms)            # adjust as needed to avoid RTIO underflows

        while True:
            data = self.execute(self._ttls, adc_delay,  N_samples, data)


    @kernel
    def execute(self, ttls, adc_delay, N_samples, data):
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

                ''' DDS '''
                with sequential:
                    for i in range(4):
                        delay(10*ns)
                        self._dds[i].set(self.dds_table[col][i][0]*Hz)
                        delay(10*ns)
                        self._dds[i].set_att(self.dds_table[col][i][1])

                ''' ADC '''
                with sequential:
                    if 1 in self.adc_table[col]:
                        # data = self.get_samples(col, N_samples[col], adc_delay, data)
                        for i in range(N_samples[col]):
                            with parallel:
                                self.sampler0.sample_mu(data[col][i])
                                delay(adc_delay)
                    else:
                        delay(time)
            col += 1
        return data
