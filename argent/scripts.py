import importlib.util
import inspect
from argent import Configurator

def list_functions(filename):
    spec = importlib.util.spec_from_file_location(filename.strip('.py').split('/')[-1], filename)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)

    functions = inspect.getmembers(module, inspect.isfunction)

    return functions

def discover_reserved_RTIO(function):
    source = inspect.getsource(function)
    devices = Configurator.load('devices')[0]

    reserved = {'dac': [], 'adc': [], 'dds': [], 'ttl': []}

    # find reserved DAC devices
    for dev in devices['dac']:
        if dev in source:
            reserved['dac'].append(dev.strip('zotino'))

    # find reserved ADC devices
    for dev in devices['adc']:
        if dev in source:
            reserved['adc'].append(dev.strip('sampler'))

    # find reserved DDS devices
    for dev in devices['dds']:
        for ch in range(4):
            devname = dev+'_ch'+str(ch)
            if devname in source:
                devnum = devname.split('_')[0].split('urukul')[1]
                reserved['dds'].append(devnum+str(ch))

    # find reserved TTL devices
    for dev in devices['ttl']:
        for ch in range(8):
            devname = dev+str(ch)
            if devname in source:
                reserved['ttl'].append(devname.strip('ttl'))

    return reserved

def find_scripts():
    ''' Loads all scripts defined in the config file and determines which RTIO channels are reserved.
        Returns a dictionary with keys corresponding to scripts and values corresponding to lists of
        (name, reserved) pairs.
    '''
    scripts = {}
    files = Configurator.load('scripts')[0]

    for file in files:
        module = file.strip('.py').split('/')[-1]
        scripts[module] = {}
        functions = list_functions(file)

        for func in functions:
            scripts[module][func[0]] = {'name': func[0], 'reserved': discover_reserved_RTIO(func[1])}

    return scripts
