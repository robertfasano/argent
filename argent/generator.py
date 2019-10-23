import os
import re
import textwrap
from argent import Configurator

class Generator:
    def __init__(self, sequences):
        self.device_db, self.devices = Configurator.load('device_db', 'devices')

        ttls = []
        for ttl in self.devices['ttl']:
            ttls.extend([f'{ttl}{i}' for i in range(8)])
        self.devices['ttl'] = ttls
        self.functions = {}
        self.sequences = sequences
        if not os.path.exists('./generated'):
            os.mkdir('./generated')
        self.write_build()
        self.write_run()
        self.write_loop(first_pass=True)
        self.write_loop(first_pass=False)

    def write_build(self):
        ''' Sets device attributes to allow access. '''
        code = ''

        ''' import all build modules '''
        build_paths = [seq.get('build_path', '') for seq in self.sequences]

        code += textwrap.dedent(f"""\
            from argent import load_build_functions
            build_functions = load_build_functions({build_paths})

            def build(self):
                self.setattr_device("core")
                self.setattr_device("scheduler")
                self.setattr_device("core_dma")
                self.online = True       # bool flag to control loop
                ''' Initialize DDS '''
                for urukul in {self.devices['dds']}:
                    self.setattr_device("%s_cpld"%(urukul))  #4 Channels of DDS
                    for i in range(4):
                        self.setattr_device('%s_ch%i'%(urukul, i))

                ''' Initialize TTL '''
                self._ttls = []
                for ttl in {self.devices['ttl']}:
                    self.setattr_device(ttl)
                    self._ttls.append(getattr(self, ttl))

                ''' Initialize DAC '''
                for dac in {self.devices['dac']}:
                    self.setattr_device(dac)          # 32 channel DAC

                ''' Initialize ADC '''
                self._adcs = []
                for adc in {self.devices['adc']}:
                    self.setattr_device(adc)         # 8 channel ADC
                    self._adcs.append(getattr(self, adc))

                for i in range({len(self.sequences)}):
                    build_functions[i](self)

                            """
                            )

        ## write build parameters
        for seq in self.sequences:
            for key, value in seq['build_parameters'].items():
                code += f'    self.{key} = {value}\n'

        with open('generated/build.py', 'w') as file:
            file.write(code)

    def write_run(self):
        ''' Generates the initial real-time part of the sequence. '''

        code = ''

        ''' Prepare data array '''
        self.all_samples = []
        for seq in self.sequences:
            N_samples = []

            for i, step in enumerate(seq['sequence']):
                if 'ADC' in step:
                    devs = [ch for ch in step['ADC']]
                    if len(devs) == 0:
                        N_samples.append(0)
                    elif len(devs) > 1:
                        raise Exception('Only one Sampler device per timestep is supported.')
                    else:
                        adc_delay = step['ADC'][devs[0]]
                        N_samples.append(int(float(step['duration'])/adc_delay))
                else:
                    N_samples.append(0)
            self.all_samples.append(N_samples)
        data = [[[0 for ch in range(8)] for n in range(sum(self.all_samples[N]))] for N in range(len(self.sequences))]
        if data == [[]]:
            data = [[[-1]]]      # add placeholder for type inference if ADC is unused

        self.durations = []
        self.adc_delays = []
        for seq in self.sequences:
            self.durations.append([step['duration'] for step in seq['sequence']])
            adc_delays = []
            for step in seq['sequence']:
                if 'ADC' in step:
                    if step['ADC'] != []:
                        adc_delays.append(list(step['ADC'].values())[0])
                    else:
                        adc_delays.append(-1.0)
                else:
                    adc_delays.append(-1.0)
            self.adc_delays.append(adc_delays)

        code += textwrap.dedent(f"""\
            from artiq.experiment import *
            from generated.loop import loop
            from generated.first_pass import loop as first_pass

            @kernel
            def run(self):
                print('Running ARTIQ sequence.')
                data = {data}

                ''' Initialize kernel '''
                self.core.reset()
                self.core.break_realtime()
                                """)

        ''' ADC initialization '''
        for adc in self.devices['adc']:
            code += f"    self.{adc}.init()\n"

        ''' DAC initialization '''
        for dac in self.devices['dac']:
            code += f"    self.{dac}.init()\n"

        ''' DDS initialization '''
        for dds in self.devices['dds']:
            code += f"""    self.{dds}_cpld.init()\n"""
        for ch in range(4):
            code += f"""    self.{dds}_ch{ch}.init()\n"""
            code += f"""    self.{dds}_ch{ch}.sw.on()\n"""

        ''' Set TTLs to output and initialize to low '''
        code += f"""    for ttl in self._ttls:\n"""
        code += f"""        ttl.output()\n"""
        code += f"""        ttl.off()\n"""

        code += f"""    self.core.break_realtime()\n\n"""
        code += f"""    delay(1*ms)\n\n"""

        code += f"""    ''' Start looping ''' \n"""
        code += f"""    first_pass(self, data)\n"""
        code += f"""    while self.online:\n"""
        code += f"""        loop(self, data)\n"""

        ''' Finish and save to file '''
        with open('generated/run.py', 'w') as file:
            file.write(code)



    def write_loop(self, first_pass=False):
        ''' Generates the looping part of the sequence step by step. '''
        code = ''
        code += 'from artiq.experiment import *\n'

        ## parse functions for import
        locators = []
        for seq in self.sequences:
            for step in seq['sequence']:
                func = step.get('Function', {})
                if func != {}:
                    locators.append((func['path'], func['function']))
        code += textwrap.dedent(f"""\
            from argent import import_functions
            functions = import_functions({locators})

            """
        )


        code += '@kernel\n'
        code += 'def loop(self, data):\n'

        func_idx = 0
        for n, seq in enumerate(self.sequences):
            for i, step in enumerate(seq['sequence']):
                if float(step['duration']) > 0:
                    code += '    with parallel:\n'
                    code += self.write_dac_events(step)
                    if first_pass:
                        last_step = {'TTL': []}
                    elif i > 0:
                        last_step = seq['sequence'][i-1]
                    else:
                        last_step = self.sequences[n-1]['sequence'][-1]
                    code += self.write_ttl_events(step, last_step)
                    code += self.write_dds_events(step)
                    code += self.write_adc_events(step, i, n)
                    if 'Function' in step:
                    # if step['Function']['function'] != '':
                        code += f'    functions[{func_idx}](self, data, {self.durations[n]}, {self.adc_delays[n]})\n'
                        func_idx += 1
            # code += f'    analysis_functions[{n}](self, data, {self.durations[n]}, {self.adc_delays[n]})\n'

        ''' Finish and save to file '''
        code += '    return data'

        if first_pass:
            with open('generated/first_pass.py', 'w') as file:
                file.write(code)
        else:
            with open('generated/loop.py', 'w') as file:
                file.write(code)

        return code

    def write_adc_events(self, step, i, n):
        ''' Generates code for the ADC events for a given step.
            i: step number
            n: sequence number
        '''
        code = ''
        if 'ADC' not in step:
            return code
        if step['ADC'] == []:
            return code
        adc_delay = self.adc_delays[n][i]
        dev = list(step['ADC'].keys())[0]
        n_samples = self.all_samples[n][i]
        previous_samples = sum(self.all_samples[n][:i])
        code += f'        self.sample(self.sampler{dev}, data[{n}], {previous_samples}, {n_samples}, {adc_delay})\n'
        return code

    def write_dac_events(self, step):
        ''' Generates code for the DAC events for a given step. For each DAC
            board in the system (e.g. zotinoA, zotinoB...), this function
            aggregates all updates for that board, then sends a bulk update.
        '''
        code = ''
        if 'DAC' not in step:
            return code
        if step['DAC'] == []:
            return code
        for dac in self.devices['dac']:
            devnum = dac.split('zotino')[1]

            ## aggregate all updates for the current dac
            channels = []
            voltages = []
            for ch in step['DAC']:
                dev = re.split(r'(\d+)',ch)[0]
                chnum = re.split(r'(\d+)',ch)[1]
                if dev == devnum:
                    channels.append(int(chnum))
                    voltages.append(float(step['DAC'][ch]))
            code += f"        self.zotino{devnum}.set_dac({voltages}, {channels})\n"
        return code

    def write_dds_events(self, step):
        ''' Generates code for the DDS events for a given step. Events are written
            in parallel across multiple channels, while events for a single channel
            (e.g. both frequency and attenuation updates) are separated with a 10 ns
            delay.
        '''
        code = ''
        if 'DDS' not in step:
            return code
        if step['DDS'] == []:
            return code

        for ch in step['DDS']:
            dev = re.split(r'(\d+)',ch)[0]    # device letter identifier
            chnum = re.split(r'(\d+)',ch)[1]  # channel integer
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
                    code += '        with sequential:\n'
                    written_sequential_block = True
                code += f'            self.urukul{dev}_ch{chnum}.set_att({att})\n'
                code += '            delay(10*ns)\n'
        return code

    def write_ttl_events(self, step, last_step):
        ''' Generates code for the TTL events for a given step. The sequence
            specification is stateful (TTL on or off) while the ARTIQ syntax is
            changeful (TTL toggled or untoggled), so this method compares against
            the previous step to determine which changes need to be made.
        '''
        code = ''
        if 'TTL' not in step:
            step['TTL'] = []
        if 'TTL' not in last_step:
            last_step['TTL'] = []
        state = step['TTL']
        last_state = last_step['TTL']

        for ch in [x for x in state if x not in last_state]:
            code += '        self.ttl{}.on()\n'.format(ch)

        for ch in [x for x in last_state if x not in state]:
            code += '        self.ttl{}.off()\n'.format(ch)
        code += '        delay({:g}*s)\n'.format(float(step['duration']))
        return code

    def run(self):
        os.system(f'start "" cmd /k "cd /argent/argent/ & call activate artiq & artiq_run base_experiment.py --device-db={self.device_db}"')
