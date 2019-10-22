import os
import re
import textwrap
from argent import Configurator

class Generator:
    def __init__(self, sequence, initial=None, analysis_path='', build_path=''):
        self.device_db, self.devices = Configurator.load('device_db', 'devices')
        self.analysis_path = analysis_path
        self.build_path = build_path

        self.ttls = []
        for ttl in self.devices['ttl']:
            self.ttls.extend([f'{ttl}{i}' for i in range(8)])

        self.sequence = sequence
        self.initial = initial
        if not os.path.exists('./generated'):
            os.mkdir('./generated')
        self.write_build()
        self.write_run(initial=initial)
        self.write_first_pass()
        self.write_loop()

    def write_build(self):
        ''' Sets device attributes to allow access. '''
        code = ''

        if self.build_path != '':
            code += textwrap.dedent(f"""\
                import importlib.util
                spec = importlib.util.spec_from_file_location("build_module", '{self.build_path}')
                build_module = importlib.util.module_from_spec(spec)
                spec.loader.exec_module(build_module)
                """
                            )

        code += textwrap.dedent(f"""\


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
                for ttl in {self.ttls}:
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
                            """
                            )

        if self.build_path != '':
            code += '    build_module.build(self)'

        with open('generated/build.py', 'w') as file:
            file.write(code)

    def write_run(self, initial=None):
        ''' Generates the initial real-time part of the sequence. '''
        ''' Prepare data array '''
        self.N_samples = []

        for i, step in enumerate(self.sequence):
            if 'ADC' in step:
                devs = [ch for ch in step['ADC']]
                if len(devs) == 0:
                    self.N_samples.append(0)
                elif len(devs) > 1:
                    raise Exception('Only one Sampler device per timestep is supported.')
                else:
                    adc_delay = step['ADC'][devs[0]]
                    self.N_samples.append(int(float(step['duration'])/adc_delay))
            else:
                self.N_samples.append(0)

        ''' Write base code '''
        code = ''
        if self.analysis_path != '':
            code += textwrap.dedent(f"""\
            import importlib.util
            spec = importlib.util.spec_from_file_location("analyze_module", '{self.analysis_path}')
            analyze_module = importlib.util.module_from_spec(spec)
            spec.loader.exec_module(analyze_module)
            """
            )
        code += textwrap.dedent(f"""\
            from artiq.experiment import *
            from generated.loop import loop
            from generated.first_pass import first_pass

            @kernel
            def run(self):
                print('Running ARTIQ sequence.')
                N_samples = {self.N_samples}
                data = [[0 for ch in range(8)] for n in range({sum(self.N_samples)})]

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

        ''' Write initial step. If none is specified, turn all DAC channels off. '''
        if self.initial is None:
            self.initial = {'duration': 10e-3,
                            'TTL': [],
                            'DAC': {}}
            for dac in self.devices['dac']:
                keys = [f'{dac[-1]}{i}' for i in range(32)]
                values = [0.0]*32
                dac_state = dict(zip(keys, values))
                self.initial['DAC'].update(dac_state)
        code += "    self.core.break_realtime()\n"
        code += "    delay(3*ms)\n"
        code += self.write_initial(self.initial)

        self.durations = [step['duration'] for step in self.sequence]
        self.adc_delays = []
        for step in self.sequence:
            if 'ADC' in step:
                if step['ADC'] != []:
                    self.adc_delays.append(list(step['ADC'].values())[0])
                else:
                    self.adc_delays.append(-1.0)
            else:
                self.adc_delays.append(-1.0)
        code += f"""    ''' First sequence iteration ''' \n"""
        code += f"""    first_pass(self, data)\n"""
        if self.analysis_path != '':
            code += f"""    analyze_module.analyze(self, data, {self.durations}, {self.adc_delays})\n"""     # run analysis script

        code += f"""    ''' Start looping ''' \n"""
        code += f"""    while self.online:\n"""
        code += f"""        loop(self, data)\n"""
        if self.analysis_path != '':
            code += f"""        analyze_module.analyze(self, data, {self.durations}, {self.adc_delays})\n"""     # run analysis script
        code += f"""    print('Experiment complete!')"""
        ''' Finish and save to file '''
        with open('generated/run.py', 'w') as file:
            file.write(code)


    def write_first_pass(self):
        ''' Generates the first loop of the sequence. '''
        code = ''
        code += 'from artiq.experiment import *\n'
        code += '@kernel\n'
        code += 'def first_pass(self, data):\n'

        ## write first step
        step = self.sequence[0]
        code += '    with parallel:\n'
        code += self.write_dac_events(step)
        code += self.write_ttl_events(step, self.initial)
        code += self.write_dds_events(step)
        code += self.write_adc_events(step, 0)

        ## write remaining steps
        for i, step in enumerate(self.sequence):
            if i == 0:
                continue
            if float(step['duration']) > 0:
                code += '    with parallel:\n'
                code += self.write_dac_events(step)
                code += self.write_ttl_events(step, self.sequence[i-1])
                code += self.write_dds_events(step)
                code += self.write_adc_events(step, i)

        ''' Finish and save to file '''
        code += '    return data'

        with open('generated/first_pass.py', 'w') as file:
            file.write(code)

        return code

    def write_loop(self):
        ''' Generates the looping part of the sequence step by step. '''
        code = ''
        code += 'from artiq.experiment import *\n'
        code += '@kernel\n'
        code += 'def loop(self, data):\n'

        for i, step in enumerate(self.sequence):
            if float(step['duration']) > 0:
                code += '    with parallel:\n'
                code += self.write_dac_events(step)
                code += self.write_ttl_events(step, self.sequence[i-1])
                code += self.write_dds_events(step)
                code += self.write_adc_events(step, i)

        ''' Finish and save to file '''
        code += '    return data'

        with open('generated/loop.py', 'w') as file:
            file.write(code)

        return code

    def write_initial(self, step):
        code = "\n    ''' Initial state '''\n"
        code += '    with parallel:\n'
        code += self.write_dac_events(step)
        code += self.write_ttl_events(step, {})
        code += self.write_dds_events(step)

        return code

    def write_adc_events(self, step, i):
        ''' Generates code for the ADC events for a given step. '''
        code = ''
        if 'ADC' not in step:
            return code
        if step['ADC'] == []:
            return code
        adc_delay = self.adc_delays[i]
        dev = list(step['ADC'].keys())[0]
        n_samples = self.N_samples[i]
        previous_samples = sum(self.N_samples[:i])
        code += f'        self.sample(self.sampler{dev}, data, {previous_samples}, {n_samples}, {adc_delay})\n'
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

if __name__ == '__main__':
    initial_state = {'duration': 100e-3, 'TTL': ['A1'], 'DAC': {'A0': 5}, 'DDS': {'A0': {'frequency':1e6}}}
    sequence = [{'duration': 10e-3, 'TTL': ['A0'], 'DAC': {'A0': 1}, 'DDS': {'A0': {'attenuation':0}}},
                {'duration': 10e-3, 'TTL': ['A2'], 'DAC': {'A0': 2}, 'DDS': {'A0': {'attenuation':31}}}
    ]
    print(sequence)
    Generator(sequence).run()
