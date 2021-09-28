import textwrap
import os
import numpy as np
from argent import Configurator, path
from .building_blocks import *
from .channel_parsing import *
from .sequence_parsing import *

''' Code generation '''
def generate_experiment(playlist, config, pid, inputs={}, outputs={}, variables={}):
    ''' The main entrypoint for the code generator. The overall process is:
        1. Remove redundant events from the sequence to minimize RTIO overhead.
        2. Generate the build stage of the experiment (defining hardware).
        3. Generate the init stage of the experiment (initializing hardware).
        4. Generate the run stage of the experiment (the main sequence loop).
        5. Assemble the code from 2-4 into a complete file.
    '''
    print('Generating playlist')
    print(playlist)
    for i, stage in enumerate(playlist):
        playlist[i]['sequence']['steps'] = remove_redundant_events(playlist[i]['sequence']['steps'])

    code = 'import requests\n'
    code += 'import numpy as np\n'
    code += 'from artiq.experiment import *\n'
    code += 'from artiq.coredevice.sampler import adc_mu_to_volt\n\n'
    with open(os.path.join(path, 'generator/array_ops.py')) as file:
        code += file.read() + '\n'
    with open(os.path.join(path, 'generator/sync.py')) as file:
        code += file.read() + '\n'
    with open(os.path.join(path, 'generator/rtio_ops.py')) as file:
        code += file.read() + '\n'
    code += 'class GeneratedSequence(EnvExperiment):\n'
    code += textwrap.indent(generate_build(playlist, pid, inputs, outputs, variables), '\t')
    code += textwrap.indent(generate_init(playlist), '\t')
    code += textwrap.indent(generate_run(playlist, config, inputs, outputs), '\t')

    return code

def generate_build(playlist, pid, inputs, outputs, variables):
    ''' Generates the build() function, in which all hardware accessed by the
        sequence is defined.
    '''
    code = ''
    code += f'self.__pid__ = "{pid}"\n'
    code += Core().build()

    ttls = get_ttl_channels(playlist)
    code += f"for ttl in {ttls}:\n\tself.setattr_device(ttl)\n"

    dacs = get_dac_channels(playlist)
    for board in dacs:
        code += Zotino(board).build()

    dds = get_dds_boards(playlist)
    for board in dds:
        code += f'self.setattr_device("{board}_cpld")\n'
    channels = get_dds_channels(playlist)
    code += f'for dds in {channels}:\n\tself.setattr_device(dds)\n'

    adcs = get_adc_boards(playlist)
    for board in adcs:
        code += Sampler(board).build()

    ## build data arrays for sampling
    code += '\n## Data arrays\n'
    arrays = get_data_arrays(playlist)
    for key, val in arrays.items():
        code += f'self.{key} = {val}\n'

    ## build output variables
    code += '\n## Outputs\n'
    for var in outputs:
        code += f'self.{var} = 0.0\n'

    ## build parameters
    code += '\n## Parameters\n'
    code += f'self.inputs = {inputs}\n'
    for name, value in inputs.items():
        code += f'self.{name} = {float(value)}\n'

    ## build variables 
    code += '\n## Variables\n'
    code += f'self.variables = {variables}\n'
    for name, value in variables.items():
        code += f'self.{name} = {float(value)}\n'

    ## build metadata variables
    code += '\n\nself.__cycle__ = 0\n'
    code = 'def build(self):\n' + textwrap.indent(code, '\t') + '\n'

    return code

def generate_init(playlist):
    ''' Generates the init() function, in which hardware defined in the build()
        function is initialized.
    '''
    code = '@kernel\ndef init(self):\n'
    code += '\t' + Core().init()
    code += '\t' + Core().break_realtime()

    ## initialize DAC boards
    dacs = get_dac_channels(playlist)
    for board in dacs:
        code += '\t' + Zotino(board).init()

    ## initialize DDS channels
    dds = get_dds_boards(playlist)
    for board in dds:
        code += f'\tself.{board}_cpld.init()\n'
    channels = get_dds_channels(playlist)
    if len(channels) > 1:
        channels_str = str(['self.' + ch for ch in channels]).replace("'", "")
        code += f'\tfor dds in {channels_str}:\n\t\tdds.init()\n'
    elif len(channels) == 1:
        channel_str = 'self.'+channels[0].replace("'", "")
        code += f'\t{channel_str}.init()\n'

    ## initialize ADC channels
    adcs = get_adc_boards(playlist)
    for board in adcs:
        code += '\t' + Sampler(board).init()

    code += '\t' + Core().break_realtime()

    return code + '\n'

def generate_run(playlist, config, inputs, outputs):
    ''' Generates the main loop of the experiment. Different stages of the overall
        playlist are written into individual kernel functions for readability,
        which are then executed repeatedly in a While block.
    '''
    code = '@kernel\ndef run(self):\n'
    code += '\tself.init()\n\n'
    code += '\twhile True:\n'

    i = 0
    for stage in playlist:
        function_call = f"\t\tself.{stage['name'].replace(' ', '_')}()\n"
        if int(stage['reps']) == 1:
            code += function_call
        else:
            code += f'\t\tfor i in range({stage["reps"]}):\n'
            code += '\t' + function_call

        ## load imported analysis scripts
        if stage['sequence']['script'] is not None:
            filename = './repository/' + stage['sequence']['script']
            with open(filename) as file:
                code += textwrap.indent(file.read(), '\t\t') + '\n'

        ## sync with server
        all_outputs = ['self.'+var for var in outputs]
        self_outputs = str(all_outputs).replace("'", "")
        self_inputs = str(['self.'+var for var in inputs]).replace("'", "")
        code += '\t\t' + f'__push__(self, {i}, "{stage["name"]}", self.__cycle__, {list(outputs.keys())}, {self_outputs}, {list(inputs.keys())}, {self_inputs}, "{config["addr"]}")\n'

        i += 1

    ## broadcast output variables
    code += '\n\t\t##Sync input variables with server\n'
    code += '\t\t' + f'__pull__(self, "{config["addr"]}")\n'


    ## update input variables
    if len(inputs) > 0:
        for var in inputs:
            code += '\t\t' + f'self.{var} = __update__(self, "{var}")\n'
        code += '\t\t' + 'print("Finished with slack", (now_mu() - self.core.get_rtio_counter_mu())*1e-6, "ms")\n'
        code += '\t\t' + 'self.core.break_realtime()\n'
        code += '\t\t' + 'delay(5*ms)\n'
    code += '\t\t' + 'self.__cycle__ += 1\n'
    code += '\n'

    ## write individual stage functions
    loops = []
    for stage in playlist:
        if stage['name'] in loops:
            continue
        code += generate_loop(stage)
        loops.append(stage['name'])

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
        return ''
    if len(events) == 1:
        return events[0]
    code = 'with sequential:\n'
    indented = ''
    for i, event in enumerate(events):
        if not i % 1 and i != 0:
            indented += 'delay(2*ns)\n'
        indented += event

    return code + textwrap.indent(indented, '\t')

def generate_loop(stage):
    ''' Generates a kernel function for a single stage of a playlist. For
        each timestep in the stage, events for different RTIO types are written
        in parallel with an overall delay defined by the step duration. Ramps
        are written in a sequential block which follows the execution of the
        initial timestep state.
    '''
    name = stage['name'].replace(' ', '_')
    sequence = stage['sequence']
    timesteps = []

    for i, step in enumerate(sequence['steps']):
        code = ''
        code += Delay(step)

        ## write initial state
        ttl_events = []
        for ch in step.get('ttl', {}):
        # for ch in step['events'][0].get('ttl', {}):
            ttl_events.append(TTL(ch).run(step))

        dac_events = []
        # for board in step['events'][0].get('dac', {}):
        for board in step.get('dac', {}):
            zotino_events = Zotino(board).initial(step)
            if zotino_events is not None:
                dac_events.append(zotino_events)

        dds_events = []
        # for channel in step['events'][0].get('dds', {}):
        for channel in step.get('dds', {}):
            dds_events.extend(Urukul(channel).run(step))
        code += write_batch([*ttl_events, *dac_events, *dds_events])


        adc_events = []
        # sampler_state = step['events'][0].get('adc', {})
        sampler_state = step.get('adc', {})
        for board, state in sampler_state.items():
            if state['enable']:
                # adc_events.append(Sampler(board).run(state))
                if int(state['samples']) == 1:
                    cmd = f'self.{board}.sample_mu(self.{stage["name"].replace(" ", "_")}_{i}[0])\n'
                else:
                    delay = float(state['duration']) / int(state['samples']) * 1e-3
                    array_name = stage["name"].replace(" ", "_") + f'_{i}'
                    cmd = f'sample(self.{board}, data=self.{array_name}, samples={state["samples"]}, wait={delay})\n'
                adc_events.append(cmd)

        for cmd in adc_events:
            code += cmd


        for board, state in sampler_state.items():
            if sampler_state[board]['enable']:
                for var, state in sampler_state[board]['variables'].items():
                    ch = state['ch']
                    operation = state['operation']
                    array_name = stage['name'].replace(' ', '_') + '_' + str(i)
                    if operation == 'min':
                        code += f'self.{var} = array_min(self.{array_name}, {ch})\n'
                    elif operation == 'max':
                        code += f'self.{var} = array_max(self.{array_name}, {ch})\n'
                    elif operation == 'mean':
                        code += f'self.{var} = array_mean(self.{array_name}, {ch})\n'
                    elif operation == 'first':
                        code += f'self.{var} = array_first(self.{array_name}, {ch})\n'
                    elif operation == 'last':
                        code += f'self.{var} = array_last(self.{array_name}, {ch})\n'
                    elif operation == 'peak-peak':
                        code += f'self.{var} = array_peak_to_peak(self.{array_name}, {ch})\n'
                    elif operation == 'max-last':
                        code += f'self.{var} = array_max_minus_last(self.{array_name}, {ch})\n'
                # code += textwrap.indent(Sampler(board).record(sampler_state[board]['variables']), '\t')

        ramps = ''
        ## write ramps, if applicable
        for board in step.get('dac', {}):
            # if 'with sequential:' in code:
            #     code += textwrap.indent(Zotino(board).ramp(step), '\t')
            # else:
            ramps += Zotino(board).ramp(step)

        for channel in step.get('dds', {}):
            # if 'with sequential:' in code:
            #     code += textwrap.indent(Urukul(channel).ramp(step), '\t')
            # else:
            ramps += Urukul(channel).ramp(step)
        if ramps != '':
            code += 'with parallel:\n'
            code += textwrap.indent('now = now_mu()\n', '\t')
            code += textwrap.indent(ramps, '\t')

        timesteps.append(code+'\n')

    all_code = ''
    for i, code in enumerate(timesteps):
        all_code += Comment(sequence['steps'][i], i)
        all_code += 'with parallel:\n'
        all_code += textwrap.indent(code, '\t')

    code = f'@kernel\ndef {name}(self):\n'
    code += textwrap.indent(all_code, '\t')
    return code


''' Convenience functions '''
def run(playlist, filename='generated_experiment.py', device_db='./device_db.py', config='./config.yml'):
    config = Configurator(config, device_db).load()
    code = generate_experiment(playlist, config)
    with open(filename, 'w') as file:
        file.write(code)
    env_name = config['environment_name']
    os.system(f'start "" cmd /k "call activate {env_name} & artiq_run generated_experiment.py --device-db \"{device_db}\""')
