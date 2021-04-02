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
            commands.append(f'self.{self.channel}.set({frequency}*MHz)\n')

        attenuation = step['dds'][self.channel].get('attenuation', None)
        if attenuation is not None:
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
