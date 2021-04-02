import textwrap
import os
import numpy as np
from argent import Configurator
from .building_blocks import *
from .channel_parsing import *
from .sequence_parsing import *

''' Code generation '''
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

    code = 'import requests\n'
    code += 'from artiq.experiment import *\n\n'
    code += 'class GeneratedSequence(EnvExperiment):\n'
    code += textwrap.indent(generate_build(macrosequence, pid), '\t')
    code += textwrap.indent(generate_init(macrosequence), '\t')
    code += textwrap.indent(generate_run(macrosequence), '\t')
    code += textwrap.indent(generate_sync(macrosequence, config), '\t')
    code += textwrap.indent(generate_pull(macrosequence, config), '\t')

    return code

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
    code += '\n## Output variables\n'
    vars = get_adc_variables(macrosequence)
    for var in vars:
        code += f'self.{var} = 0.0\n'

    ## build input variables
    code += '\n## Input variables\n'
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
            ttl_events.append(TTL(ch).run(step['events'][0]))

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


''' Convenience functions '''
def run(macrosequence, filename='generated_experiment.py', device_db='./device_db.py', config='./config.yml'):
    config = Configurator(config, device_db).load()
    code = generate_experiment(macrosequence, config)
    with open(filename, 'w') as file:
        file.write(code)
    env_name = config['environment_name']
    os.system(f'start "" cmd /k "call activate {env_name} & artiq_run generated_experiment.py --device-db \"{device_db}\""')
