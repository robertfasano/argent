import textwrap
import os
from argent import Configurator, path
from .building_blocks import *
from .channel_parsing import *
from .sequence_parsing import *

from jinja2 import Environment, PackageLoader, select_autoescape

env = Environment(
    loader=PackageLoader("argent"),
    autoescape=select_autoescape(),
    trim_blocks=False
)

''' Code generation '''
def generate_experiment(playlist, config, pid, variables={}, parameters={}):
    ''' The main entrypoint for the code generator. The overall process is:
        1. Remove redundant events from the sequence to minimize RTIO overhead.
        2. Generate the build stage of the experiment (defining hardware).
        3. Generate the init stage of the experiment (initializing hardware).
        4. Generate the run stage of the experiment (the main sequence loop).
        5. Assemble the code from 2-4 into a complete file.
    '''
    print('Generating playlist')
    print(playlist)
    for i in range(len(playlist)):
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

    channels = {'ttl': get_ttl_channels(playlist),
            'dac': get_dac_channels(playlist),
            'cpld': [x+'_cpld' for x in get_dds_boards(playlist)],
            'dds': get_dds_channels(playlist),
            'adc': get_adc_boards(playlist),
            'cam': get_grabber_boards(playlist)}

    code += textwrap.indent(env.get_template("build.j2").render(pid=pid, 
                                                                variables=variables, 
                                                                parameters=parameters, 
                                                                arrays=get_data_arrays(playlist),
                                                                channels=channels
                                                                ), 
                            '\t')
    code += textwrap.indent(env.get_template("init.j2").render(channels=channels), '\t') + '\n'
    code += textwrap.indent(generate_run(playlist, config, variables, parameters), '\t')

    return code


def generate_run(playlist, config, variables, parameters):
    ''' Generates the main loop of the experiment. Different stages of the overall
        playlist are written into individual kernel functions for readability,
        which are then executed repeatedly in a While block.
    '''
    code = '@kernel\ndef run(self):\n'
    code += '\tself.init()\n\n'
    code += '\twhile True:\n'

    i = 0
    for stage in playlist:
        ## load imported prep scripts
        if stage['sequence']['script']['preparation'] is not None:
            filename = './repository/' + stage['sequence']['script']['preparation']
            with open(filename) as file:
                code += textwrap.indent(file.read(), '\t\t') + '\n'

        function_call = f"\t\tself.{stage['name'].replace(' ', '_')}()\n"
        if int(stage['reps']) == 1:
            code += function_call
        else:
            code += f'\t\tfor i in range({stage["reps"]}):\n'
            code += '\t' + function_call

        ## load imported analysis scripts
        if stage['sequence']['script']['analysis'] is not None:
            filename = './repository/' + stage['sequence']['script']['analysis']
            with open(filename) as file:
                code += textwrap.indent(file.read(), '\t\t') + '\n'

        ## sync with server
        all_parameters = ['self.'+var for var in parameters]
        self_parameters = str(all_parameters).replace("'", "")
        self_variables = str(['self.'+var for var in variables]).replace("'", "")
        if parameters == {} and variables == {}:
            code += '\t\t' + f'__heartbeat__(self, {i}, "{stage["name"]}", self.__cycle__, "{config["addr"]}")\n'
        elif parameters == {}:
            code += '\t\t' + f'__push_variables__(self, {i}, "{stage["name"]}", self.__cycle__, {list(variables.keys())}, {self_variables}, "{config["addr"]}")\n'
        elif variables == {}:
            code += '\t\t' + f'__push_parameters__(self, {i}, "{stage["name"]}", self.__cycle__, {list(parameters.keys())}, {self_parameters}, "{config["addr"]}")\n'
        else:
            code += '\t\t' + f'__push__(self, {i}, "{stage["name"]}", self.__cycle__, {list(parameters.keys())}, {self_parameters}, {list(variables.keys())}, {self_variables}, "{config["addr"]}")\n'

        i += 1

    ## broadcast parameters and variables
    code += '\n\t\t##Sync variables with server\n'
    code += '\t\t' + f'__pull__(self, "{config["addr"]}")\n'


    ## update input variables
    if len(variables) > 0:
        for var in variables:
            code += '\t\t' + f'self.{var} = __update__(self, "{var}")\n'
        code += '\t\t' + 'print("Finished with slack", (now_mu() - self.core.get_rtio_counter_mu())*1e-6, "ms")\n'
        code += '\t\t' + 'self.core.break_realtime()\n'
        code += '\t\t' + 'delay(10*ms)\n'
    code += '\t\t' + 'self.__cycle__ += 1\n'
    code += '\n'

    ## write individual stage functions
    stages = []
    for stage in playlist:
        if stage['name'] in stages:
            continue
        code += generate_stage(stage)
        stages.append(stage['name'])

    return code

def generate_stage(stage):
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
        code += f"delay({step['duration']}*ms)\n"
        step_code = ''

        ## ttl
        on = str(['self.'+ch for ch, state in step.get('ttl', {}).items() if state == True]).replace("'", "")
        off = str(['self.'+ch for ch, state in step.get('ttl', {}).items() if state == False]).replace("'", "")
        step_code += textwrap.indent(env.get_template("ttl.j2").render(on=on, off=off), '\t') 

        ## dac
        for board in step.get('dac', {}):
            event = Zotino(board).initial(step)
            if event is not None:
                step_code += '\t' + 'delay(20*ns)' + '\n'
                step_code += '\t' + event

        ## dds rf switch
        on = []
        off = []
        for ch in step['dds']:
            enabled = step['dds'][ch].get('enable', None)
            if enabled:
                on.append(ch)
            elif enabled == False:
                off.append(ch)
        on = str(['self.'+ch for ch in on]).replace("'", "")
        off = str(['self.'+ch for ch in off]).replace("'", "")
        step_code += textwrap.indent(env.get_template("rf_switch.j2").render(on=on, off=off), '\t') 

        ## dds frequency and attenuation
        for channel in step.get('dds', {}):
            events = Urukul(channel).run(step)
            for event in events:
                step_code += '\t' + event

        ## imaging
        grabber_state = step.get('cam', {})
        for board, state in grabber_state.items():
            if state['enable']:
                step_code += '\t' + f'self.{board}.setup_roi(0, {state["ROI"][0][0]}, {state["ROI"][1][0]}, {state["ROI"][0][1]}, {state["ROI"][1][1]})\n'
                step_code += '\t' + f'self.{board}.gate_roi_pulse(1, {state["duration"]}*ms)\n'
                step_code += '\t' + 'n = [0]\n'
                if state['parameter'] != '':
                    step_code += '\t' + f'self.{board}.input_mu(n)\n'
                    step_code += '\t' + f'{state["parameter"]}=float(n[0])\n'

        ## adc
        sampler_state = step.get('adc', {})
        for board, state in sampler_state.items():
            if state['enable']:
                if int(state['samples']) == 1:
                    cmd = f'self.{board}.sample_mu(self.{stage["name"].replace(" ", "_")}_{i}[0])\n'
                else:
                    delay = float(state['duration']) / int(state['samples']) * 1e-3
                    array_name = stage["name"].replace(" ", "_") + f'_{i}'
                    cmd = f'sample(self.{board}, data=self.{array_name}, samples={state["samples"]}, wait={delay})\n'
                step_code += '\t' + cmd

                op_map = {'min': 'array_min', 'max': 'array_max', 'mean': 'array_mean', 'first': 'array_first', 'last': 'array_last', 'peak-peak': 'array_peak_to_peak'}
                for var, state in sampler_state[board]['variables'].items():
                    ch = state['ch']
                    array_name = stage['name'].replace(' ', '_') + '_' + str(i)
                    func = op_map[state['operation']]
                    if state['operation'] in op_map.keys():
                        step_code += '\t' + f'self.{var} = {func}(self.{array_name}, {ch})\n'

        ramps = ''
        ## write ramps, if applicable
        for board in step.get('dac', {}):
            ramps += Zotino(board).ramp(step)

        for channel in step.get('dds', {}):
            ramps += Urukul(channel).ramp(step)
        if ramps != '':
            step_code += '\t' + 'with parallel:\n'
            step_code += textwrap.indent('now = now_mu()\n', '\t\t')
            step_code += textwrap.indent(ramps, '\t\t')

        if step_code != '':
            code += 'with sequential:\n'
            code += step_code

        timesteps.append(code+'\n')

    all_code = ''
    for i, code in enumerate(timesteps):
        if sequence['steps'][i].get('skip', False):
            all_code += "'''" + '\n'
        all_code += Comment(sequence['steps'][i], i)
        all_code += 'with parallel:\n'
        all_code += textwrap.indent(code, '\t')
        if sequence['steps'][i].get('skip', False):
            all_code += "'''" + '\n'

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
