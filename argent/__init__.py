import json
import re
import os

class Configurator:
    @staticmethod
    def load(field=None):
        with open('config.json') as file:
            config = json.load(file)
        if field is None:
            return config
        else:
            return config[field]

    @staticmethod
    def save(config):
        output = json.dumps(config, indent=4)
        output = re.sub(r'": \[\s+', '": [', output)
        output = re.sub(r'"\s+\]', '"]', output)

        with open('config.json', 'w') as file:
            file.write(output)

    @staticmethod
    def update(field, new_value):
        config = Configurator.load()
        config[field] = new_value
        Configurator.save(config)

config = Configurator.load()
if not os.path.exists(config['sequences_path']):
    os.mkdir(config['sequences_path'])
