import yaml
import re
import os

class Configurator:
    @staticmethod
    def load(*fields):
        ''' Loads and returns the configuration file. If fields are specified,
            returns only the corresponding values. '''
        with open('config.yml') as file:
            config = yaml.load(file, Loader=yaml.SafeLoader)
        if len(fields) == 0:
            return config
        else:
            return [config[f] for f in fields]

    @staticmethod
    def save(config):
        with open('config.yml', 'w') as file:
            yaml.dump(config, file)


    @staticmethod
    def update(field, new_value):
        config = Configurator.load()
        config[field] = new_value
        Configurator.save(config)

config = Configurator.load()
if not os.path.exists(config['sequences_path']):
    os.mkdir(config['sequences_path'])
