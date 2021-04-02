import yaml
import re
import os

path = os.path.dirname(__file__)

class Configurator:
    def __init__(self, config_path):
        self.config_path = config_path

    def load(self, *fields):
        ''' Loads and returns the configuration file. If fields are specified,
            returns only the corresponding values. '''
        with open(self.config_path) as file:
            config = yaml.load(file, Loader=yaml.SafeLoader)
        if len(fields) == 0:
            return config
        else:
            return [config[f] for f in fields]

    def save(self, config):
        with open(self.config_path, 'w') as file:
            yaml.dump(config, file)

    def update(self, field, new_value):
        config = self.load()
        config[field] = new_value
        self.save(config)

# from .generator.generator import run
