''' Building blocks for code generation '''

def Comment(step, i):
    name = step.get('label', '')
    if name == '':
        name = f'Sequence timestep {i}'
    return f'## {name}\n'

class Urukul:
    ''' A container for code generation related to the Urukul DDS. '''
    def __init__(self, channel):
        self.channel = channel

    def run(self, step):
        commands = []

        frequency = step['dds'][self.channel].get('frequency', {})
        if frequency != {}:
            if frequency['mode'] == 'setpoint' and frequency['setpoint'] != '':
                commands.append(f'self.{self.channel}.set(frequency={frequency["setpoint"]}*MHz)\n')

            elif frequency['mode'] == 'ramp':
                start = frequency['ramp']['start']
                commands.append(f'self.{self.channel}.set({start}*MHz)\n')


        attenuation = step['dds'][self.channel].get('attenuation', {})
        if attenuation != {}:
            if attenuation['mode'] == 'setpoint' and attenuation['setpoint'] != '':
                setpoint = attenuation['setpoint']
                commands.append(f'self.{self.channel}.set_att({setpoint})\n')


        return commands

    def ramp(self, step):
        ''' Only one channel can be ramped at once '''
        if step['dds'][self.channel].get('frequency', {}).get('mode', {}) != 'ramp':
            return ''
        ramp = step['dds'][self.channel]['frequency']['ramp']
        ramp_cmd = ''
        duration = f'{step["duration"]}*ms'
        ramp_cmd += f"ramp_DDS(self.{self.channel}, {ramp['start']}, {ramp['stop']}, {ramp['steps']}, {duration}, now)\n"
        ramp_cmd = ramp_cmd.replace("'", "") 
        return ramp_cmd

class Zotino:
    ''' A container for code generation related to Zotino DAC boards. '''
    def __init__(self, board):
        self.board = board
        
    def initial(self, step):
        channels = []
        voltages = []

        for ch, state in step['dac'][self.board].items():
            if state['mode'] == 'setpoint' and state['setpoint'] != '':
                voltages.append(state['setpoint'])
                channels.append(int(ch.split(self.board)[1]))

            elif state['mode'] == 'ramp':
                voltages.append(state['ramp']['start'])
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

            steps = int(state['ramp']['steps'])
            starts.append(state['ramp']['start'])
            stops.append(state['ramp']['stop'] )

        if steps == 0:
            return ''
        ramp_cmd = ''
        duration = f'{step["duration"]}*ms'
        ramp_cmd += f"ramp(self.{self.board}, {channels}, {starts}, {stops}, {steps}, {duration}, now)\n"
        ramp_cmd = ramp_cmd.replace("'", "")
        return ramp_cmd
