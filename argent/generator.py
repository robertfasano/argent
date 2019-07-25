import os
import re
from argent import Configurator

config = Configurator.load()
ttls = []
for ttl in config['devices']['ttl']:
    ttls.extend([f'{ttl}{i}' for i in range(8)])
device_db = config['device_db']
devices = config['devices']

def write_build():
    code = f"""
def build(self):
    self.setattr_device("core")
    self.setattr_device("scheduler")
    self.setattr_device("core_dma")
    ''' Initialize DDS '''
    for urukul in {devices['dds']}:
        self.setattr_device("%s_cpld"%(urukul))  #4 Channels of DDS
        for i in range(4):
            self.setattr_device('%s_ch%i'%(urukul, i))

    ''' Initialize TTL '''
    self._ttls = []
    for ttl in {ttls}:
        self.setattr_device(ttl)
        self._ttls.append(getattr(self, ttl))

    ''' Initialize DAC '''
    for dac in {devices['dac']}:
        self.setattr_device(dac)          # 32 channel DAC

    ''' Initialize ADC '''
    self._adcs = []
    for adc in {devices['adc']}:
        self.setattr_device(adc)         # 8 channel ADC
        self._adcs.append(getattr(self, adc))
            """

    with open('generated/build.py', 'w') as file:
        file.write(code)


def write_run(sequence, initial=None):
    ''' Prepare data array '''
    N_samples = []

    for i in range(len(sequence)):
        if 'ADC' in sequence[i]:
            devs = [ch for ch in sequence[i]['ADC']]
            if len(devs) == 0:
                N_samples.append(0)
            elif len(devs) > 1:
                raise Exception('Only one Sampler device per timestep is supported.')
            else:
                adc_delay = sequence[i]['ADC'][devs[0]]
                N_samples.append(int(float(sequence[i]['duration'])/adc_delay))
        else:
            N_samples.append(0)

    ''' Write base code '''
    code = f"""
from artiq.experiment import *
from generated.loop import loop
from conversion import convert_to_dataframe
@kernel
def run(self):
    print('Running ARTIQ sequence.')
    N_samples = {N_samples}
    data = [[[0 for ch in range(8)] for n in range(N_samples[i])] for i in range({len(sequence)})]
    ''' Initialize kernel '''
    self.core.reset()
    self.core.break_realtime()
    """
    ## NOTE: simplifying thie data declaration using pythonic syntax like
    ## [0 for ch in range(8)] -> [0]*8 can cause different list elements
    ## to share byte addresses, such that updating one will update all

    ''' DAC initialization '''
    for dac in devices['dac']:
        code += f"self.{dac}.init()\n"

    ''' DDS initialization '''
    for dds in devices['dds']:
        code += f"""
    self.{dds}_cpld.init()"""
    for ch in range(4):
        code += f"""
    self.{dds}_ch{ch}.init()
    self.{dds}_ch{ch}.sw.on()"""


    ''' Set TTLs to output and initialize to low '''
    code += f"""

    for ttl in self._ttls:
        ttl.output()
        ttl.off()
    """

    ''' Initialize DACs to 0 V '''
    for dac in devices['dac']:
        code += f"""
    delay(2*ms)
    self.{dac}.set_dac([0.0]*32, list(range(32)))
    self.core.break_realtime()\n\n"""

    ''' Write initial step '''
    if initial is not None:
        code += "    '''Prepare initial state'''\n"
        code += write_initial(initial)

        ''' Since TTLs are stateful, we need to manually switch off any TTLs which were turned on
            in the initial step but will be off in the first step of the sequence '''
        code += "\n    '''Prepare TTLs for loop'''\n"
        if 'TTL' in initial:
            if 'TTL' in sequence[0]:
                next_ttls = sequence[0]['TTL']
            else:
                next_ttls = []
            to_turn_off = [ttl for ttl in initial['TTL'] if ttl not in next_ttls]
            for ttl in to_turn_off:
                code += f"""    self.ttl{ttl}.off()\n"""

    durations = [step['duration'] for step in sequence]
    adc_delays = []
    for step in sequence:
        if 'ADC' in step:
            if step['ADC'] != []:
                adc_delays.append(list(step['ADC'].values())[0])
            else:
                adc_delays.append(-1.0)
        else:
            adc_delays.append(1.0)
    code += f"""
    delay(10*us)
    # while True:
    loop(self, data)
    convert_to_dataframe(data, {durations}, {adc_delays})
    """

    ''' Finish and save to file '''
    with open('generated/run.py', 'w') as file:
        file.write(code)

def write_initial(step):
    code = ''
    code += '    with parallel:\n'

    ''' Write DAC events '''
    if 'DAC' in step:
        for dac in devices['dac']:
            devnum = dac.split('zotino')[1]
            channels = []
            voltages = []
            for ch in step['DAC']:
                dev = re.split(r'(\d+)',ch)[0]
                chnum = re.split(r'(\d+)',ch)[1]
                if dev == devnum:
                    channels.append(int(chnum))
                    voltages.append(float(step['DAC'][ch]))
            code += f"        self.zotino{devnum}.set_dac({voltages}, {channels})\n"

    ''' Write TTL events '''
    to_turn_on = [x for x in step['TTL']]
    for ch in to_turn_on:
        code += '        self.ttl{}.on()\n'.format(ch)

    code += '        delay({:g}*s)\n'.format(float(step['duration']))



    ''' Write DDS events '''
    if 'DDS' in step:
        for ch in step['DDS']:
            dev = re.split(r'(\d+)',ch)[0]
            chnum = re.split(r'(\d+)',ch)[1]
            written_sequential_block = False

            if 'frequency' in step['DDS'][ch]:
                freq = float(step['DDS'][ch]['frequency'])
                if not written_sequential_block:
                    code += '        with sequential:\n'
                    written_sequential_block = True
                code += f'            self.urukul{dev}_ch{chnum}.set({freq}*Hz)\n'
                code += '            delay(10*ns)\n'

            if 'attenuation' in step['DDS'][ch]:
                att = float(step['DDS'][ch]['attenuation'])
                if not written_sequential_block:
                    code += '\t\twith sequential:\n'
                    written_sequential_block = True
                code += f'            self.urukul{dev}_ch{chnum}.set_att({att})\n'
                code += '            delay(10*ns)\n'

    return code

def write_step(step, last_step, i):
    code = ''
    ''' Write TTL events '''
    to_turn_on = [x for x in step['TTL'] if x not in last_step['TTL']]
    to_turn_off = [x for x in last_step['TTL'] if x not in step['TTL']]
    if i == 0:
        to_turn_on = [x for x in step['TTL']]
    code += '\twith parallel:\n'

    ''' Write DAC events '''
    code += '\t\twith sequential:\n'
    code += '\t\t\tdelay(10*ns)\n'
    if 'DAC' in step:
        for dac in devices['dac']:
            devnum = dac.split('zotino')[1]
            channels = []
            voltages = []
            for ch in step['DAC']:
                dev = re.split(r'(\d+)',ch)[0]
                chnum = re.split(r'(\d+)',ch)[1]
                if dev == devnum:
                    channels.append(int(chnum))
                    voltages.append(float(step['DAC'][ch]))
            code += f"\t\t\tself.zotino{devnum}.set_dac({voltages}, {channels})\n"

    ''' Write TTL events '''
    for ch in to_turn_on:
        code += '\t\tself.ttl{}.on()\n'.format(ch)

    for ch in to_turn_off:
        code += '\t\tself.ttl{}.off()\n'.format(ch)
    code += '\t\tdelay({:g}*s)\n'.format(float(step['duration']))



    ''' Write DDS events '''
    if 'DDS' in step:
        for ch in step['DDS']:
            dev = re.split(r'(\d+)',ch)[0]
            chnum = re.split(r'(\d+)',ch)[1]
            written_sequential_block = False

            if 'frequency' in step['DDS'][ch]:
                freq = float(step['DDS'][ch]['frequency'])
                if not written_sequential_block:
                    code += '\t\twith sequential:\n'
                    written_sequential_block = True
                code += f'\t\t\tself.urukul{dev}_ch{chnum}.set({freq}*Hz)\n'
                code += '\t\t\tdelay(10*ns)\n'

            if 'attenuation' in step['DDS'][ch]:
                att = float(step['DDS'][ch]['attenuation'])
                if not written_sequential_block:
                    code += '\t\twith sequential:\n'
                    written_sequential_block = True
                code += f'\t\t\tself.urukul{dev}_ch{chnum}.set_att({att})\n'
                code += '\t\t\tdelay(10*ns)\n'


    ''' Write ADC events '''
    if 'ADC' in step:
        if step['ADC'] != []:
            adc_delay = list(step['ADC'].values())[0]
            dev = list(step['ADC'].keys())[0]
            n_samples = int(float(step['duration'])/adc_delay)
            code += f'\t\tself.sample(self.sampler{dev}, data, {i}, {n_samples}, {adc_delay})\n'

    return code

def write_loop(sequence):
    ''' Write base code '''
    code = ''
    code += 'from artiq.experiment import *\n'
    code += '@kernel\n'
    code += 'def loop(self, data, initial=False):\n'

    dac_state = [0]*32

    for i in range(len(sequence)):
        if float(sequence[i]['duration']) > 0:
            code += write_step(sequence[i], sequence[i-1], i)

    ''' Finish and save to file '''
    code += '\treturn data'

    with open('generated/loop.py', 'w') as file:
        file.write(code)

    return code

def generate(sequence, initial=None):
    if not os.path.exists('./generated'):
        os.mkdir('./generated')
    write_build()
    write_run(sequence, initial=initial)
    write_loop(sequence)

def run_sequence(sequence, initial=None):
    generate(sequence, initial=initial)
    os.system(f'start "" cmd /k "cd /argent/argent/ & call activate artiq-4 & artiq_run base_experiment.py --device-db={device_db}"')

if __name__ == '__main__':
    initial_state = {'duration': 100e-3, 'TTL': ['A1'], 'DAC': {'A0': 5}, 'DDS': {'A0': {'frequency':1e6}}}
    sequence = [{'duration': 10e-3, 'TTL': ['A0'], 'DAC': {'A0': 1}, 'DDS': {'A0': {'attenuation':0}}},
                {'duration': 10e-3, 'TTL': ['A2'], 'DAC': {'A0': 2}, 'DDS': {'A0': {'attenuation':31}}}
    ]
    print(sequence)
    run_sequence(sequence, initial=initial_state)
