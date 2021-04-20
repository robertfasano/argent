''' Building blocks for code generation '''
import numpy as np

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
        for name, ch in variables.items():
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

        frequency = step['dds'][self.channel].get('frequency', {})
        # if frequency is not None:
        #     commands.append(f'self.{self.channel}.set({frequency}*MHz)\n')
        if frequency != {}:
            if frequency['mode'] == 'constant' and frequency['constant'] != '':
                commands.append(f'self.{self.channel}.set({frequency["constant"]}*MHz)\n')

            elif frequency['mode'] == 'variable':
                cmd = f'self.{self.channel}.set(self.{frequency["variable"]}*MHz)\n'
                commands.append(cmd)

        attenuation = step['dds'][self.channel].get('attenuation', '')
        if attenuation != '':
            commands.append(f'self.{self.channel}.set_att({float(attenuation)})\n')

        return commands

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
            value = float(voltage_str.split(' ')[0])
            unit = voltage_str.split(' ')[1]
            return value * {'V': 1, 'mV': 1e-3, 'uV': 1e-6}[unit]

    def initial(self, step):
        channels = []
        voltages = []

        for ch, state in step['dac'][self.board].items():
            if state['mode'] == 'constant' and state['constant'].split(' ')[0] != '':
                voltages.append(self.parse(state['constant']))
                channels.append(int(ch.split(self.board)[1]))
            elif state['mode'] == 'ramp':
                voltages.append(self.parse(state['ramp']['start']))
                channels.append(int(ch.split(self.board)[1]))
            elif state['mode'] == 'variable':
                voltages.append("self." + state['variable'])
                channels.append(int(ch.split(self.board)[1]))

        if len(voltages) == 0:
            return ''
        return f'self.{self.board}.set_dac({voltages}, {channels})\n'.replace("'", "")

    def ramp(self, step):
        channels = []
        ramp = None
        for ch, state in step['dac'][self.board].items():
            if state['mode'] != 'ramp':
                continue
            channels.append(int(ch.split(self.board)[1]))
            start = self.parse(state['ramp']['start'])
            stop = self.parse(state['ramp']['stop'])
            steps = int(state['ramp']['steps'])
            if ramp is None:
                ramp = np.atleast_2d(np.linspace(start, stop, steps)).T
            else:
                ramp = np.hstack([ramp, np.atleast_2d(np.linspace(start, stop, steps)).T])

        if ramp is None:
            return ''

        ramp_cmd = '\n## DAC ramp\n'
        duration = float(step['duration'].split(' ')[0]) * {'s': 1, 'ms': 1e-3, 'us': 1e-6}[step['duration'].split(' ')[1]]
        delay = duration / int(state['ramp']['steps'])
        for voltages in ramp[1::]:
            ramp_cmd += f'self.delay({delay})\n'
            ramp_cmd += f'self.{self.board}.set_dac({voltages}, {channels})\n'
        return ramp_cmd

class TTL:
    ''' A container for code generation related to TTL devices. '''
    def __init__(self, ch):
        self.ch = ch

    def build(self):
        return f'self.setattr_device("{self.ch}")\n'

    def init(self):
        return f'self.{self.ch}.off()\n'

    def run(self, step):
        if step['ttl'][self.ch]:
            return f"self.{self.ch}.on()\n"
        else:
            return f"self.{self.ch}.off()\n"

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
