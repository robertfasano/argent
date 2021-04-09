import numpy as np

def get_ttl_channels(macrosequence):
    ''' Crawls through the macrosequence to assemble a list of all TTL channels
        whose state is specified at some point. Returns a list of the format
        ['ttlA0', 'ttlA1', ...]
    '''
    ttls = []
    for stage in macrosequence:
        sequence = stage['sequence']['steps']
        for step in sequence:
            ttls.extend(step.get('ttl', {}).keys())
    return list(np.unique(ttls))

def get_dac_channels(macrosequence):
    ''' Crawls through the macrosequence to assemble a list of all DAC boards
        whose state is specified at some point. Returns a list of the format
        ['zotinoA'].
    '''
    dacs = []
    for stage in macrosequence:
        sequence = stage['sequence']['steps']
        for step in sequence:
            dacs.extend(step.get('dac', {}).keys())
    return list(np.unique(dacs))

def get_adc_boards(macrosequence):
    ''' Crawls through the macrosequence to assemble a list of all ADC boards
        which are enabled at some state. Returns a list of the format
        ['samplerA'].
    '''
    boards = []
    for stage in macrosequence:
        sequence = stage['sequence']['steps']
        for step in sequence:
            for board in step['adc']:
                if step['adc'][board]['enable']:
                    boards.append(board)
    return list(np.unique(boards))

def get_adc_variables(macrosequence):
    ''' Crawls through the macrosequence to assemble a list of all ADC variables
        to define in the build() stage. Returns a list of the format
        ['variable1', 'variable2'].
    '''
    vars = []
    for stage in macrosequence:
        sequence = stage['sequence']['steps']
        for step in sequence:
            for board in step['adc']:
                if step['adc'][board]['enable']:
                    vars.extend(step['adc'][board]['variables'].keys())
    return list(np.unique(vars))

def get_data_arrays(macrosequence):
    arrays = {}
    for stage in macrosequence:
        sequence = stage['sequence']['steps']
        for i, step in enumerate(sequence):
            for board in step['adc']:
                if step['adc'][board]['enable']:
                    name = stage['name'].replace(' ', '_') + '_' + str(i)
                    arrays[name] = f'[[0]*8]*{int(step["adc"][board]["samples"])}'

    return arrays

def get_dds_boards(macrosequence):
    ''' Crawls through the macrosequence to assemble a list of all DDS boards
        whose state is specified at some point. Returns a list of the format
        ['urukulA', 'urukulB']. Assumes that the device names in the device_db
        follow the syntax {board}_ch{i} for channels (e.g. urukulA_ch0) and
        {board}_cpld for CPLDs (e.g. urukulA_cpld).
    '''
    boards = []
    for stage in macrosequence:
        for step in stage['sequence']['steps']:
            boards.extend([ch.split('_')[0] for ch in step.get('dds', {}).keys()])
    return list(np.unique(boards))

def get_dds_channels(macrosequence):
    channels = []
    for stage in macrosequence:
        for step in stage['sequence']['steps']:
            channels.extend(step.get('dds', {}).keys())
    return list(np.unique(channels))

def get_input_variables(macrosequence):
    inputs = {}
    for stage in macrosequence:
        for name, value in stage['sequence']['inputs'].items():
            inputs[name] = float(value)
    return inputs
