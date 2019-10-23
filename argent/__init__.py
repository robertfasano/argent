import yaml
import re
import os
path = os.path.dirname(__file__)

class Configurator:
    @staticmethod
    def load(*fields):
        ''' Loads and returns the configuration file. If fields are specified,
            returns only the corresponding values. '''
        config_path = os.path.join(path, 'config.yml')
        with open(config_path) as file:
            config = yaml.load(file, Loader=yaml.SafeLoader)
        if len(fields) == 0:
            return config
        else:
            return [config[f] for f in fields]

    @staticmethod
    def save(config):
        with open(os.path.join(path, 'config.yml'), 'w') as file:
            yaml.dump(config, file)


    @staticmethod
    def update(field, new_value):
        config = Configurator.load()
        config[field] = new_value
        Configurator.save(config)

config = Configurator.load()
if not os.path.exists(config['sequences_path']):
    os.mkdir(config['sequences_path'])

import importlib.util

def load_build_functions(paths):
    build_functions = []

    def pass_build(self):
        return

    for path in paths:
        if path == '':
            build_functions.append(pass_build)
        else:
            spec = importlib.util.spec_from_file_location(path, path)
            module = importlib.util.module_from_spec(spec)
            spec.loader.exec_module(module)
            build_functions.append(module.build)

    return build_functions

def import_module(path):
    ''' Import a function by name from the .py file specified by path. '''
    spec = importlib.util.spec_from_file_location(path, path)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def import_functions(locators):
    ''' Takes a list of (path, name) tuples. Returns a single-level list
        containing imported functions in order of the sequence and timestep in
        which they occur.
    '''
    functions = []
    for loc in locators:
        module = import_module(loc[0])
        functions.append(getattr(module, loc[1]))

    return functions
