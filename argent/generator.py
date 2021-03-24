import textwrap
import os
from copy import deepcopy
import numpy as np
from argent import Configurator

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
        return ', '.join(f"{key}" for (key, val) in variables.items())
    return ', '.join(f"{key}={val}" for (key, val) in variables.items())


class Sampler:
    ''' A container for code generation related to the Sampler ADC '''
    def __init__(self, board):
        self.board = board

    def build(self):
        return f'self.setattr_device("{self.board}")\nself.data = [0.0]*8\n'

    def init(self):
        return f'self.{self.board}.init()\n'

    def run(self, state):
        code = ''
        if state['delay'] != '0 s':
            code += f'delay({state["delay"].replace(" ", "*")})\n\t'
        code += f'self.{self.board}.sample(self.data)\n'
        return code

    def record(self, variables):
        code = ''
        for ch, name in variables.items():
            code += f'self.{name} = self.data[{ch}]\n'
        return code

class Urukul:
    ''' A container for code generation related to the Urukul DDS. '''
    def __init__(self, channel):
        self.channel = channel

    def build(self):
        return f'self.setattr_device("{self.channel}")\n'

    def init(self):
        return f'self.{self.channel}.init()\n\tdelay(10*us)\n'

    def run(self, step):
        commands = []
        enable = step['dds'][self.channel].get('enable', None)
        if enable is not None:
            commands.append(f'self.{self.channel}.cfg_sw({enable})\n')

        frequency = step['dds'][self.channel].get('frequency', None)
        if frequency is not None:
            # value, unit = frequency.split(' ')
            # commands.append(f'self.{self.channel}.set({value}*{unit})\n')
            commands.append(f'self.{self.channel}.set({frequency}*MHz)\n')

        attenuation = step['dds'][self.channel].get('attenuation', None)
        if attenuation is not None:
            commands.append(f'self.{self.channel}.set_att({float(attenuation)})\n')

        return commands
        # if len(commands) == 0:
        #     return ''
        # if len(commands) == 1:
        #     return commands[0]
        # code = 'with sequential:\n'
        # for command in commands:
        #     code += '\t' + command
        # return code

class CPLD:
    ''' A container for code generation related to the Urukul CPLD. '''
    def __init__(self, board):
        self.board = board

    def build(self):
        return f'self.setattr_device("{self.board}_cpld")\n'

    def init(self):
        return f'self.{self.board}_cpld.init()\n\tdelay(10*us)\n'

class Zotino:
    ''' A container for code generation related to Zotino DAC boards. '''
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
            if 'Var' in voltage_str:
                variable = voltage_str.replace('Var(', '').replace(')', '')
                return "self."+variable
            value = float(voltage_str.split(' ')[0])
            unit = voltage_str.split(' ')[1]
            return value * {'V': 1, 'mV': 1e-3, 'uV': 1e-6}[unit]

    def run(self, step):
        voltages = [self.parse(V) for V in step["dac"][self.board].values()]
        voltages = str(voltages).replace("'", '')
        channels = [int(ch) for ch in step["dac"][self.board].keys()]
        return f'self.{self.board}.set_dac({voltages}, {channels})\n'


class TTL:
    ''' A container for code generation related to TTL devices. '''
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
        # if step['ttl'][self.ch]:
        #     return f"self.{self.ch}.pulse({float(value)}*{unit})\n"
        if step['ttl'][self.ch]:
            return f"self.{self.ch}.on()\n"
        else:
            return f"self.{self.ch}.off()\n"

        # return ''

class Core:
    ''' A container for code generation related to the core device. '''
    def __init__(self, name='core'):
        self.name = name

    def build(self):
        return f"self.setattr_device('{self.name}')\n"

    def init(self):
        return f"self.{self.name}.reset()\n"

    def break_realtime(self):
        return f"self.{self.name}.break_realtime()\n"


''' Code generation '''
def get_ttl_channels(macrosequence):
    ''' Crawls through the macrosequence to assemble a list of all TTL channels
        whose state is specified at some point. Returns a list of the format
        ['ttlA0', 'ttlA1', ...]
    '''
    ttls = []
    for stage in macrosequence:
        # print('stage:', stage)
        sequence = stage['sequence']['steps']
        for step in sequence:
            ttls.extend(step.get('ttl', {}).keys())
    return list(np.unique(ttls))

def get_dac_channels(macrosequence):
    ''' Crawls through the macrosequence to assemble a list of all DAC boards
        whose state is specified at some point. Returns a list of the format
        ['zotinoA'].
    '''
    dacs = []
    for stage in macrosequence:
        sequence = stage['sequence']['steps']
        for step in sequence:
            dacs.extend(step.get('dac', {}).keys())
    return list(np.unique(dacs))

def get_adc_boards(macrosequence):
    ''' Crawls through the macrosequence to assemble a list of all ADC boards
        which are enabled at some state. Returns a list of the format
        ['samplerA'].
    '''
    boards = []
    for stage in macrosequence:
        sequence = stage['sequence']['steps']
        for step in sequence:
            for board in step['adc']:
                if step['adc'][board]['enable']:
                    boards.append(board)
    return list(np.unique(boards))

def get_adc_variables(macrosequence):
    ''' Crawls through the macrosequence to assemble a list of all ADC variables
        to define in the build() stage. Returns a list of the format
        ['variable1', 'variable2'].
    '''
    vars = []
    for stage in macrosequence:
        sequence = stage['sequence']['steps']
        for step in sequence:
            for board in step['adc']:
                if step['adc'][board]['enable']:
                    vars.extend(step['adc'][board]['variables'].values())
    return list(np.unique(vars))

def get_dds_boards(macrosequence):
    ''' Crawls through the macrosequence to assemble a list of all DDS boards
        whose state is specified at some point. Returns a list of the format
        ['urukulA', 'urukulB']. Assumes that the device names in the device_db
        follow the syntax {board}_ch{i} for channels (e.g. urukulA_ch0) and
        {board}_cpld for CPLDs (e.g. urukulA_cpld).
    '''
    boards = []
    for stage in macrosequence:
        for step in stage['sequence']['steps']:
            boards.extend([ch.split('_')[0] for ch in step.get('dds', {}).keys()])
    return list(np.unique(boards))

def get_dds_channels(macrosequence):
    channels = []
    for stage in macrosequence:
        for step in stage['sequence']['steps']:
            channels.extend(step.get('dds', {}).keys())
    return list(np.unique(channels))

def get_input_variables(macrosequence):
    inputs = {}
    for stage in macrosequence:
        for name, value in stage['sequence']['inputs'].items():
            inputs[name] = float(value)
    return inputs

def generate_build(macrosequence, pid):
    ''' Generates the build() function, in which all hardware accessed by the
        sequence is defined.
    '''
    code = ''
    code += f'self.__pid__ = "{pid}"\n'
    code += Core().build()

    ttls = get_ttl_channels(macrosequence)
    code += f"for ttl in {ttls}:\n\tself.setattr_device(ttl)\n"

    dacs = get_dac_channels(macrosequence)
    for board in dacs:
        code += Zotino(board).build()

    dds = get_dds_boards(macrosequence)
    for board in dds:
        code += f'self.setattr_device("{board}_cpld")\n'
    channels = get_dds_channels(macrosequence)
    code += f'for dds in {channels}:\n\tself.setattr_device(dds)\n'

    adcs = get_adc_boards(macrosequence)
    for board in adcs:
        code += Sampler(board).build()

    ## build output variables
    code += '\n##Output variables\n'
    vars = get_adc_variables(macrosequence)
    for var in vars:
        code += f'self.{var} = 0.0\n'

    ## build input variables
    code += '\n##Input variables\n'
    inputs = get_input_variables(macrosequence)
    code += f'self.inputs = {inputs}\n'
    for name, value in inputs.items():
        code += f'self.{name} = {float(value)}\n'
    code = 'def build(self):\n' + textwrap.indent(code, '\t') + '\n'
    return code

def generate_init(macrosequence):
    ''' Generates the init() function, in which hardware defined in the build()
        function is initialized.
    '''
    code = '@kernel\ndef init(self):\n'
    code += '\t' + Core().init()
    code += '\t' + Core().break_realtime()

    ## initialize DAC boards
    dacs = get_dac_channels(macrosequence)
    for board in dacs:
        code += '\t' + Zotino(board).init()

    ## initialize DDS channels
    dds = get_dds_boards(macrosequence)
    for board in dds:
        code += f'\tself.{board}_cpld.init()\n'
    channels = get_dds_channels(macrosequence)
    if len(channels) > 1:
        channels_str = str(['self.' + ch for ch in channels]).replace("'", "")
        code += f'\tfor dds in {channels_str}:\n\t\tdds.init()\n'
    else:
        channel_str = 'self.'+channels[0].replace("'", "")
        code += f'\t{channel_str}.init()\n'

    ## initialize ADC channels
    adcs = get_adc_boards(macrosequence)
    for board in adcs:
        code += '\t' + Sampler(board).init()

    code += '\t' + Core().break_realtime()

    return code + '\n'

def generate_pull(macrosequence, config):
    inputs = get_input_variables(macrosequence)

    code = '@rpc(flags={"async"})\ndef pull(self):\n'
    code += '\t' + f'self.inputs = requests.get("http://{config["addr"]}/inputs").json()\n'

    # for var in inputs:
    #     code += '\t' + f'self.{var} = inputs["{var}"]\n'

    code += '\n'

    code += 'def __update__(self, name) -> TFloat:\n'
    code += '\t' + 'return float(self.inputs[name])\n'


    return code

def write_batch(events):
    ''' Adds a batch of events into the generated code. The events argument
        should be a list of generated events, e.g.
            ['ttlA0.on()\n', 'ttlA1.off()\n']
        This function concatenates these events into a larger sequence with
        some special logic:
        * If there is more than one event, events are written in a sequential block
        * A small delay is inserted every 8 events to avoid sequence collisions
    '''
    if len(events) == 0:
        return events[0]
    code = 'with sequential:\n'
    for i, event in enumerate(events):
        if not i % 8 and i != 0:
            code += '\tdelay(2*ns)\n'
        code += '\t' + event

    return code

def generate_loop(stage):
    ''' Generates a kernel function for a single stage of a macrosequence. For
        each timestep in the stage, events for different RTIO types are written
        in parallel with an overall delay defined by the step duration. Ramps
        are written in a sequential block which follows the execution of the
        initial timestep state.
    '''
    name = stage['name'].replace(' ', '_')
    sequence = stage['sequence']
    variables = stage['sequence'].get('inputs', {})
    timesteps = []

    for step in parse_sequence(sequence['steps']):
        code = ''
        code += Delay(step)

        ## write initial state
        ttl_events = []
        for ch in step['events'][0].get('ttl', {}):
            ttl_events.append(TTL(ch).run(step['events'][0], step['duration']))

        dac_events = []
        for board in step['events'][0].get('dac', {}):
            dac_events.append(Zotino(board).run(step['events'][0]))

        dds_events = []
        for channel in step['events'][0].get('dds', {}):
            dds_events.extend(Urukul(channel).run(step['events'][0]))

        adc_events = []
        sampler_state = step['events'][0].get('adc', {})
        for board, state in sampler_state.items():
            if state['enable']:
                adc_events.append(Sampler(board).run(state))

        code += write_batch([*ttl_events, *dac_events, *dds_events, *adc_events])

        for board, state in sampler_state.items():
            if sampler_state[board]['enable']:
                code += textwrap.indent(Sampler(board).record(sampler_state[board]['variables']), '\t')

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
        all_code += Comment(sequence['steps'][i], i)
        all_code += 'with parallel:\n'
        all_code += textwrap.indent(code, '\t')

    # loop_args = Arguments(variables, keys_only=True)
    # if loop_args != '':
    #     loop_args = ', ' + loop_args
    code = f'@kernel\ndef {name}(self):\n'
    code += textwrap.indent(all_code, '\t')
    return code

def generate_sync(macrosequence, config):
    code = '@rpc(flags={"async"})\ndef sync(self, *variables):\n'

    vars = get_adc_variables(macrosequence)

    if len(vars) == 0:
        code += '\ttry:\n'
        code += '\t\tpayload={"__pid__": self.__pid__}\n'
        code += f'\t\trequests.post("http://{config["addr"]}/heartbeat", json=payload)\n'
        code += '\texcept:\n\t\tpass\n'
    else:
        code += f'\tvars = dict(zip({vars}, variables))\n'
        code += '\tprint(vars)\n'
        code += '\tvars["__pid__"] = self.__pid__\n'
        code += '\ttry:\n'
        code += f'\t\trequests.post("http://{config["addr"]}/outputs", json=vars)\n'
        code += '\texcept:\n\t\tpass\n'
    code += '\n'
    return code

def generate_run(macrosequence):
    ''' Generates the main loop of the experiment. Different stages of the overall
        macrosequence are written into individual kernel functions for readability,
        which are then executed repeatedly in a While block.
    '''
    code = '@kernel\ndef run(self):\n'
    code += '\tself.init()\n\n'
    code += '\twhile True:\n'
    if len(get_input_variables(macrosequence)) > 0:
        code += '\t\t' + 'self.pull()\n'

    for stage in macrosequence:
        function_call = f"\t\tself.{stage['name'].replace(' ', '_')}()\n"
        if int(stage['reps']) == 1:
            code += function_call
        else:
            code += f'\t\tfor i in range({stage["reps"]}):\n'
            code += '\t' + function_call

    ## broadcast output variables
    vars = get_adc_variables(macrosequence)
    # if len(vars) > 0:
    self_vars = ['self.'+var for var in vars]
    code += '\t\t' + f'self.sync({", ".join(self_vars)})'
    code += '\n'

    ## update input variables
    vars = get_input_variables(macrosequence)
    if len(vars) > 0:
        for var in vars:
            code += '\t\t' + f'self.{var} = self.__update__("{var}")\n'
        code += '\t\t' + 'self.core.break_realtime()\n'
        code += '\t\t' + 'delay(5*ms)\n'
        
    code += '\n'

    ## write individual stage functions
    loops = []
    for stage in macrosequence:
        if stage['name'] in loops:
            continue
        code += generate_loop(stage)
        loops.append(stage['name'])

    # code += generate_sync(macrosequence)

    return code

def generate_experiment(macrosequence, config, pid):
    ''' The main entrypoint for the code generator. The overall process is:
        1. Remove redundant events from the sequence to minimize RTIO overhead.
        2. Generate the build stage of the experiment (defining hardware).
        3. Generate the init stage of the experiment (initializing hardware).
        4. Generate the run stage of the experiment (the main sequence loop).
        5. Assemble the code from 2-4 into a complete file.
    '''
    print('Generating macrosequence')
    print(macrosequence)
    for i, stage in enumerate(macrosequence):
        macrosequence[i]['sequence']['steps'] = remove_redundant_events(macrosequence[i]['sequence']['steps'])
    print('Removed redundant events')
    print(macrosequence)

    code = 'import requests\n'
    code += 'from artiq.experiment import *\n\n'
    code += 'class GeneratedSequence(EnvExperiment):\n'
    code += textwrap.indent(generate_build(macrosequence, pid), '\t')
    code += textwrap.indent(generate_init(macrosequence), '\t')
    code += textwrap.indent(generate_run(macrosequence), '\t')
    code += textwrap.indent(generate_sync(macrosequence, config), '\t')
    code += textwrap.indent(generate_pull(macrosequence, config), '\t')

    return code

def parse_sequence(sequence):
    ''' Separate all sequence steps into individual events using the
        parse_events() method.
    '''
    new_sequence = []
    for step in sequence:
        new_sequence.append({'duration': step['duration'],
                             'name': step.get('name', ''),
                             'events': parse_events(step)
                            })
    return new_sequence

def parse_events(step):
    ''' Separate a sequence step into individual events, i.e. for ramp event
        replacement. This function receives a timestep which could prescribe
        both setpoints which are constant during a step as well as parameters
        which vary during a step, like a linear voltage ramp. Events are grouped
        in a dictionary with keys representing their relative delay from the
        start of the step. This allows the code generator to account for
        simultaneous events; in cases like the Zotino board, these events need to
        be executed with a single function call.
    '''
    events = {0: {'ttl': {}, 'dac': {}, 'dds': {}, 'adc': {}}}

    for ch in step['ttl'].keys():
        events[0]['ttl'][ch] = step['ttl'][ch]

    for ch in step['dds'].keys():
        events[0]['dds'][ch] = {}
        for key in ['enable', 'frequency', 'attenuation']:
            if key in step['dds'][ch]:
                events[0]['dds'][ch][key] = step['dds'][ch][key]

    for board, state in step['adc'].items():
        events[0]['adc'][board] = {}
        for key in ['enable', 'variables', 'delay']:
            if key in state:
                events[0]['adc'][board][key] = state[key]


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

def remove_redundant_events(sequence):
    new_sequence = deepcopy(sequence)
    print('sequence length:', len(new_sequence))
    for i, step in enumerate(new_sequence):
        if i == 0:
            continue
        last_step = sequence[i-1]
        print('last_step:', i, last_step)
        ## TTL events
        channels = list(step['ttl'].keys())
        for ch in channels:
            if last_step['ttl'][ch] == step['ttl'][ch]:
                del step['ttl'][ch]

        ## DAC events
        boards = list(step['dac'].keys())
        for board in boards:
            channels = list(step['dac'][board].keys())
            for ch in channels:
                if last_step['dac'][board].get(ch, None) == step['dac'][board][ch]:
                    del step['dac'][board][ch]

        ## DDS events
        channels = list(step['dds'].keys())
        for ch in channels:
            for key in ['enable', 'frequency']:
                if key in step['dds'][ch]:
                    if last_step['dds'][ch].get(key, None) == step['dds'][ch][key]:
                        # print('Deleting redundant DDS event', ch, key)
                        del step['dds'][ch][key]
                        # print('Remaining DDS events:', step['dds'])

    return new_sequence

''' Convenience functions '''
def run(macrosequence, filename='generated_experiment.py', device_db='./device_db.py', config='./config.yml'):
    config = Configurator(config, device_db).load()
    code = generate_experiment(macrosequence, config)
    with open(filename, 'w') as file:
        file.write(code)
    env_name = config['environment_name']
    os.system(f'start "" cmd /k "call activate {env_name} & artiq_run generated_experiment.py --device-db \"{device_db}\""')
