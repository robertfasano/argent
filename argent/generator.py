import numpy as np
import textwrap

''' Building blocks for code generation '''

def Delay(step):
    if 'var' in str(step['duration']):
        duration = step['duration'].split('var: ')[1]
    else:
        value, unit = step['duration'].split(' ')
    return f"delay({float(value)}*{unit})\n"

def Comment(step, i):
    name = step.get('name', f'Sequence timestep {i}')
    return f'## {name}\n'

def Arguments(variables, keys_only=False):
    if keys_only:
        return ', '.join(f"{key}" for (key,val) in variables.items())
    return ', '.join(f"{key}={val}" for (key,val) in variables.items())

class Zotino:
    def __init__(self, board):
        self.board = board

    def build(self):
        return f'self.setattr_device("{self.board}")\n'

    def init(self):
        return f'self.{self.board}.init()\n\tdelay(10*ms)\n'

    def parse(self, voltage_str):
        ''' Parse a string of the form "{value} {unit}" and returns a value scaled
            to the base unit. If no unit is present, no scaling is performed.
        '''
        try:
            return float(voltage_str)
        except ValueError:
            value = float(voltage_str.split(' ')[0])
            unit = voltage_str.split(' ')[1]
            return value * {'V': 1, 'mV': 1e-3, 'uV': 1e-6}[unit]

    def run(self, step):
        voltages = [self.parse(V) for V in step["dac"][self.board].values()]
        channels = [int(ch) for ch in step["dac"][self.board].keys()]
        return f'self.{self.board}.set_dac({voltages}, {channels})\n'


class TTL:
    def __init__(self, ch):
        self.ch = ch

    def build(self):
        return f'self.setattr_device("{self.ch}")\n'

    def init(self):
        return f'self.{self.ch}.off()\n'

    def run(self, step, duration):
        # if 'var' in str(duration):
        #     duration = duration.split('var: ')[1]
        #
        # if 'var' in str(step['ttl'][self.ch]):
        #     var_name = str(step['ttl'][self.ch]).split('var: ')[1]
        #     return f"if {var_name}:\n\tself.{self.ch}.pulse({float(duration)})\n"
        value, unit = duration.split(' ')
        if step['ttl'][self.ch]:
            return f"self.{self.ch}.pulse({float(value)}*{unit})\n"
        return ''

class Core:
    def __init__(self, name='core'):
        self.name = name

    def build(self):
        return f"self.setattr_device('{self.name}')\n"

    def init(self):
        return f"self.{self.name}.reset()\n"

    def break_realtime(self):
        return f"self.{self.name}.break_realtime()\n"


''' Code generation '''

def generate_run(macrosequence):
    code = '@kernel\ndef run(self):\n'
    code += '\tself.init()\n\n'
    code += '\twhile True:\n'
    for stage in macrosequence:
        function_call = f"\t\tself.{stage['name'].replace(' ', '_')}({Arguments(stage.get('variables', {}))})\n"
        if int(stage['reps']) == 1:
            code += function_call
        else:
            code += f'\t\tfor i in range({stage["reps"]}):\n'
            code += '\t' + function_call
    code += '\n'

    loops = []
    for stage in macrosequence:
        if stage['name'] in loops:
            continue
        code += generate_loop(stage)
        loops.append(stage['name'])

    return code

def generate_loop(stage):
    name = stage['name'].replace(' ', '_')
    sequence = stage['sequence']
    variables = stage.get('variables', {})
    timesteps = []

    for step in parse_sequence(sequence):
        code = ''
        code += Delay(step)

        ## write initial state
        print(step['events'][0])
        for ch in step['events'][0].get('ttl', {}):
            code += TTL(ch).run(step['events'][0], step['duration'])

        for board in step['events'][0].get('dac', {}):
            code += Zotino(board).run(step['events'][0])

        ## write ramps, if applicable
        if len(step['events']) > 1:
            code += 'with sequential:\n'
            last_time = 0
            for t in step['events']:
                event = step['events'][t]
                if t == 0:
                    continue
                dt = np.round(t - last_time, 9)
                last_time = t
                code += '\t' + f"delay({dt})\n"
                for board in event.get('dac', {}):
                    code += '\t' + Zotino(board).run(event)


        timesteps.append(code+'\n')

    all_code = ''
    for i, code in enumerate(timesteps):
        all_code += Comment(sequence[i], i)
        all_code += 'with parallel:\n'
        all_code += textwrap.indent(code, '\t')

    loop_args = Arguments(variables, keys_only=True)
    if loop_args != '':
        loop_args = ', ' + loop_args
    code = f'@kernel\ndef {name}(self{loop_args}):\n'
    code += textwrap.indent(all_code, '\t')
    return code

# def generate_loop(stage):
#     name = stage['name'].replace(' ', '_')
#     sequence = stage['sequence']
#     variables = stage.get('variables', {})
#     timesteps = []
#
#     for step in sequence:
#         code = ''
#         code += Delay(step)
#
#         for ch in step.get('ttl', {}):
#             code += TTL(ch).run(step)
#
#         for board in step.get('dac', {}):
#             code += Zotino(board).run(step)
#
#         timesteps.append(code+'\n')
#
#     all_code = ''
#     for i, code in enumerate(timesteps):
#         all_code += Comment(sequence[i], i)
#         all_code += 'with parallel:\n'
#         all_code += textwrap.indent(code, '\t')
#
#     loop_args = Arguments(variables, keys_only=True)
#     if loop_args != '':
#         loop_args = ', ' + loop_args
#     code = f'@kernel\ndef {name}(self{loop_args}):\n'
#     code += textwrap.indent(all_code, '\t')
#     return code

def get_ttl_channels(macrosequence):
    ttls = []
    for stage in macrosequence:
        sequence = stage['sequence']
        for step in sequence:
            ttls.extend(step.get('ttl', {}).keys())
    return np.unique(ttls)

def get_dac_channels(macrosequence):
    dacs = []
    for stage in macrosequence:
        sequence = stage['sequence']
        for step in sequence:
            dacs.extend(step.get('dac', {}).keys())
    return np.unique(dacs)

def generate_build(macrosequence):
    code = ''
    code += Core().build()

    ttls = get_ttl_channels(macrosequence)
    for ch in ttls:
        code += TTL(ch).build()

    dacs = get_dac_channels(macrosequence)
    for board in dacs:
        code += Zotino(board).build()

    code = 'def build(self):\n' + textwrap.indent(code, '\t') + '\n'
    return code

def generate_init(macrosequence):
    code = '@kernel\ndef init(self):\n'
    code += '\t' + Core().init()
    code += '\t' + Core().break_realtime()

    # initialize TTLs to false
    ttls = get_ttl_channels(macrosequence)
    for ch in ttls:
        code += '\t' + TTL(ch).init()

    dacs = get_dac_channels(macrosequence)
    for board in dacs:
        code += '\t' + Zotino(board).init()

    code += '\t' + Core().break_realtime()

    return code + '\n'

def generate_experiment(macrosequence):
    print('Generating macrosequence')
    print(macrosequence)
    code = 'from artiq.experiment import *\n\n'
    code += 'class GeneratedSequence(EnvExperiment):\n'
    code += textwrap.indent(generate_build(macrosequence), '\t')
    code += textwrap.indent(generate_init(macrosequence), '\t')
    code += textwrap.indent(generate_run(macrosequence), '\t')

    return code

def parse_sequence(sequence):
    ''' Separate all sequence steps into individual events '''
    new_sequence = []
    for step in sequence:
        new_sequence.append({'duration': step['duration'],
                             'name': step.get('name', ''),
                             'events': parse_events(step)
                            })
    return new_sequence

def parse_events(step):
    ''' Separate a sequence step into individual events, i.e. for ramp event replacement '''
    events = {0: {'ttl': {}, 'dac': {}}}
    for ch in step['ttl'].keys():
        events[0]['ttl'][ch] = step['ttl'][ch]

    for board in step['dac']:
        for ch in step['dac'][board].keys():
            value = step['dac'][board][ch]

            if 'Ramp' in value:
                start, stop, steps = value.replace('Ramp(', '').replace(')', '').split(',')
                start = float(start.split(' ')[0]) * {'V': 1, 'mV': 1e-3, 'uV': 1e-6}[start.split(' ')[1]]
                stop = float(stop.split(' ')[0]) * {'V': 1, 'mV': 1e-3, 'uV': 1e-6}[stop.split(' ')[1]]

                voltages = np.linspace(start, stop, int(steps))

                duration = float(step['duration'].split(' ')[0]) * {'s': 1, 'ms': 1e-3, 'us': 1e-6}[step['duration'].split(' ')[1]]
                dt = duration / int(steps)
                t = np.arange(0, duration, dt).round(8)

                for i in range(len(voltages)):
                    if t[i] not in events:
                        events[t[i]] = {}
                    if 'dac' not in events[t[i]]:
                        events[t[i]]['dac'] = {board: {}}
                    if board not in events[t[i]]['dac']:
                        events[t[i]]['dac'][board] = {}
                    events[t[i]]['dac'][board][ch] = voltages[i]
            else:
                if board not in events[0]['dac']:
                    events[0]['dac'][board] = {}
                events[0]['dac'][board][ch] = value

        return dict(sorted(events.items()))

''' Convenience functions '''
from argent import Configurator
import os
def run(macrosequence, filename='generated_experiment.py', device_db='./device_db.py', config='./config.yml'):
    code = generate_experiment(macrosequence)
    with open(filename, 'w') as file:
        file.write(code)
    config = Configurator(config, device_db).load()
    env_name = config['environment_name']
    os.system(f'start "" cmd /k "call activate {env_name} & artiq_run generated_experiment.py --device-db \"{device_db}\""')
