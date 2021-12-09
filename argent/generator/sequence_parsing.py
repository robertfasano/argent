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
