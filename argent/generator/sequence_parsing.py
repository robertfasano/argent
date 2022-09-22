from copy import deepcopy
import numpy as np

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
        if last_step.get('skip', False):
            continue
        ## TTL events
        channels = list(step['ttl'].keys())
        for ch in channels:
            if last_step['ttl'][ch] == step['ttl'][ch]:
                del step['ttl'][ch]

        ## DDS events
        channels = list(step['dds'].keys())
        for ch in channels:
            for key in ['enable']:
                if key in step['dds'][ch]:
                    if last_step['dds'][ch].get(key, None) == step['dds'][ch][key]:
                        del step['dds'][ch][key]

    return new_sequence

def validate_sequence(sequence):
    ''' Checks for errors in a sequence and raises an exception if any are found. '''

    def validate_number(num, exception, timestep):
        try:
            if 'self.' not in str(num):
                float(num)
        except:
            raise ValueError(exception + f' in timestep {timestep}.')
    
    for i, step in enumerate(sequence):
        validate_number(step['duration'], 'Invalid duration', i)
        
        for board in step['dac']:
            for channel in step['dac'][board]:
                state = step['dac'][board][channel]
                if state['mode'] == 'setpoint':
                    if state['setpoint'] != '':
                        validate_number(state['setpoint'], f'Invalid DAC setpoint for board {board}, channel {channel}', i)
                elif state['mode'] == 'ramp':
                    validate_number(state['ramp']['start'], f'Invalid DAC ramp start for board {board}, channel {channel}', i)
                    validate_number(state['ramp']['stop'], f'Invalid DAC ramp stop for board {board}, channel {channel}', i)
                    validate_number(state['ramp']['steps'], f'Invalid DAC ramp steps for board {board}, channel {channel}', i)

        for channel in step['dds']:
            for out_type in ['attenuation', 'frequency']:
                state = step['dds'][channel][out_type]
                if state['mode'] == 'setpoint':
                    if state['setpoint'] != '':
                        validate_number(state['setpoint'], f'Invalid DDS {out_type} setpoint for channel {channel}', i)
                elif state['mode'] == 'ramp':
                    validate_number(state['ramp']['start'], f'Invalid DDS {out_type} ramp start for channel {channel}', i)
                    validate_number(state['ramp']['stop'], f'Invalid DDS {out_type} ramp stop for channel {channel}', i)
                    validate_number(state['ramp']['steps'], f'Invalid DDS {out_type} ramp steps for channel {channel}', i)

        for board in step['adc']:
            validate_number(step['adc'][board]['delay'], f'Invalid ADC delay for board {board}', i)
            validate_number(step['adc'][board]['samples'], f'Invalid number of ADC samples for board {board}', i)
            validate_number(step['adc'][board]['duration'], f'Invalid ADC sampling duration for board {board}', i)