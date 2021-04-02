from copy import deepcopy
import numpy as np

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
    ''' Returns a copy of the sequence with all redundant events removed. A redundant
        event is one which does not change the state relative to the last timestep,
        e.g. setting a TTL channel on in two concurrent timesteps, and this function
        produces a sequence which is functionally identical to the input but with
        lower load on the ARTIQ processor.
    '''
    new_sequence = deepcopy(sequence)
    for i, step in enumerate(new_sequence):
        if i == 0:
            continue
        last_step = sequence[i-1]
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
                        del step['dds'][ch][key]

    return new_sequence
