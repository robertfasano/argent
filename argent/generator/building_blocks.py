''' Building blocks for code generation '''

def Delay(step):
    if 'self.' in str(step['duration']):
        return f"delay({step['duration']}*ms)\n"
    else:
        value, unit = step['duration'].split(' ')
    return f"delay({float(value)}*{unit})\n"

def Comment(step, i):
    name = step.get('name', f'Sequence timestep {i}')
    return f'## {name}\n'

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
        if frequency != {}:
            if frequency['mode'] == 'setpoint' and frequency['setpoint'] != '':
                commands.append(f'self.{self.channel}.set({frequency["setpoint"]}*MHz)\n')

            elif frequency['mode'] == 'ramp':
                start = frequency['ramp']['start']
                if 'self.' not in start:
                    start = float(start)
                commands.append(f'self.{self.channel}.set({start}*MHz)\n')


        attenuation = step['dds'][self.channel].get('attenuation', {})
        if attenuation != {}:
            if attenuation['mode'] == 'setpoint' and attenuation['setpoint'] != '':
                setpoint = attenuation['setpoint']
                if 'self.' not in setpoint:
                    setpoint = float(setpoint)
                commands.append(f'self.{self.channel}.set_att({setpoint})\n')


        return commands

    def ramp(self, step):
        ''' Only one channel can be ramped at once '''
        if step['dds'][self.channel].get('frequency', {}).get('mode', {}) != 'ramp':
            return ''
        ramp = step['dds'][self.channel]['frequency']['ramp']

        start = ramp['start']
        if 'self.' not in start:
            start = float(start)
        
        stop = ramp['stop']
        if 'self.' not in stop:
            stop = float(stop)
 
        steps = int(ramp['steps'])

        ramp_cmd = "\n## DDS ramp\n"
        if 'self.' in step['duration']:
            duration = f'{step["duration"]}*ms'
        else:
            duration = float(step['duration'].split(' ')[0]) * {'s': 1, 'ms': 1e-3, 'us': 1e-6}[step['duration'].split(' ')[1]]
        ramp_cmd += f"ramp_DDS(self.{self.channel}, {start}, {stop}, {steps}, {duration}, now)\n"
        ramp_cmd = ramp_cmd.replace("'", "") 
        return ramp_cmd

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
        
    def initial(self, step):
        channels = []
        voltages = []

        for ch, state in step['dac'][self.board].items():
            if state['mode'] == 'setpoint' and state['setpoint'] != '':
                setpoint = state['setpoint']
                if 'self.' not in setpoint:
                    setpoint = float(setpoint)
                voltages.append(state['setpoint'])
                channels.append(int(ch.split(self.board)[1]))

            elif state['mode'] == 'ramp':
                start = state['ramp']['start']
                if 'self.' not in start:
                    start = float(start)
                voltages.append(start)
                channels.append(int(ch.split(self.board)[1]))


        if len(voltages) == 0:
            return None
        return f'self.{self.board}.set_dac({voltages}, {channels})\n'.replace("'", "")

    def ramp(self, step):
        channels = []
        starts = []
        stops = []
        steps = 0
        for ch, state in step['dac'][self.board].items():
            if state['mode'] != 'ramp':
                continue
            channels.append(int(ch.split(self.board)[1]))

            start = state['ramp']['start']
            if 'self.' not in start:
                start = float(start)
            stop = state['ramp']['stop']
            if 'self.' not in stop:
                stop = float(stop)       
            steps = int(state['ramp']['steps'])
            starts.append(start)
            stops.append(stop)

        if steps == 0:
            return ''
        ramp_cmd = "\n## DAC ramp\n"
        if 'self.' in step['duration']:
            duration = f'{step["duration"]}*ms'
        else:
            duration = float(step['duration'].split(' ')[0]) * {'s': 1, 'ms': 1e-3, 'us': 1e-6}[step['duration'].split(' ')[1]]
        ramp_cmd += f"ramp(self.{self.board}, {channels}, {starts}, {stops}, {steps}, {duration}, now)\n"
        ramp_cmd = ramp_cmd.replace("'", "")
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
