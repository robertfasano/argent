import numpy as np
import textwrap

''' Building blocks for code generation '''

def Delay(step):
    if 'var' in str(step['duration']):
        duration = step['duration'].split('var: ')[1]
    else:
        duration = step['duration']
    return f"delay({duration})\n"

def Comment(step, i):
    name = step.get('name', f'Sequence timestep {i}')
    return f'## {name}\n'

def Arguments(variables, keys_only=False):
    if keys_only:
        return ', '.join(f"{key}" for (key,val) in variables.items())
    return ', '.join(f"{key}={val}" for (key,val) in variables.items())

class TTL:
    def __init__(self, ch):
        self.ch = ch

    def build(self):
        return f'self.setattr_device("{self.ch}")\n'

    def run(self, step):
        if 'var' in str(step['duration']):
            duration = step['duration'].split('var: ')[1]
        else:
            duration = step['duration']

        if 'var' in str(step['ttl'][self.ch]):
            var_name = str(step['ttl'][self.ch]).split('var: ')[1]
            return f"if {var_name}:\n\tself.{self.ch}.pulse({duration})\n"

        if step['ttl'][self.ch]:
            return f"self.{self.ch}.pulse({duration})\n"
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
        code += f"\t\tself.{stage['name']}({Arguments(stage.get('variables', {}))})\n"

    code += '\n'

    loops = []
    for stage in macrosequence:
        if stage['name'] in loops:
            continue
        code += generate_loop(stage)
        loops.append(stage['name'])

    return code

def generate_loop(stage):
    name = stage['name']
    sequence = stage['sequence']
    variables = stage.get('variables', {})
    timesteps = []

    for step in sequence:
        code = ''
        code += Delay(step)

        for ch in step.get('ttl', {}):
            code += TTL(ch).run(step)

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

def generate_build(macrosequence):
    code = ''
    code += Core().build()

    ttls = []
    for stage in macrosequence:
        sequence = stage['sequence']
        for step in sequence:
            ttls.extend(step.get('ttl', {}).keys())
    ttls = np.unique(ttls)
    for ch in ttls:
        code += TTL(ch).build()

    code = 'def build(self):\n' + textwrap.indent(code, '\t') + '\n'
    return code

def generate_init(sequence):
    code = '@kernel\ndef init(self):\n'
    code += '\t' + Core().init()
    code += '\t' + Core().break_realtime()
    return code + '\n'

def generate_experiment(macrosequence):
    code = 'from artiq.experiment import *\n\n'
    code += 'class GeneratedSequence(EnvExperiment):\n'
    code += textwrap.indent(generate_build(macrosequence), '\t')
    code += textwrap.indent(generate_init(macrosequence), '\t')
    code += textwrap.indent(generate_run(macrosequence), '\t')

    return code

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
