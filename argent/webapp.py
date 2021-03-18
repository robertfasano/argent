import json
import os
import sys
import click
import subprocess
from flask import Flask, request
from flask import render_template, send_from_directory
from argent.generator import generate_experiment
from argent import Configurator, path

class App:
    ''' Handles the server backend which forms the link between the webapp client
        and the code generator/ARTIQ experiment submission. Requires a config.yml
        file with the following fields:
        - device_db: the path of the device_db.py file for the ARTIQ system
        - environment_name: the conda environment where ARTIQ is installed
        - aliases: optional display names to override the default channel names.
                   For example, 'ttlA0' could be replaced with 'probe rf'.
    '''
    def __init__(self, config='./config.yml'):
        print('Running Argent webapp...')
        print('Using config file at', os.path.abspath(config))
        self.config = Configurator(config).load()
        self.device_db = self.config['device_db']
        print('Using device_db at', os.path.abspath(self.device_db))

        self.variables = {}

        self.host()

    def host(self):
        ''' Run the Flask server on a given address and port '''
        app = Flask(__name__)

        @app.route('/favicon.ico')
        def favicon():
            ''' Provides the ARTIQ tab icon '''
            return send_from_directory(os.path.join(app.root_path, 'static'),
                                       'favicon.ico', mimetype='image/vnd.microsoft.icon')

        @app.route("/")
        def hello():
            ''' The main entrypoint for the webapp '''
            return render_template('index.html',
                                   sequences=json.dumps({}),
                                   channels=channels(),
                                   aliases=self.config['aliases'],
                                   version=version()
                                  )

        @app.route("/generate", methods=['POST'])
        def generate():
            ''' Posting a macrosequence to this endpoint will trigger code
                generation. The experiment will not be sent to the hardware.
            '''
            sequence = request.json
            code = generate_experiment(sequence, self.config)
            with open('generated_experiment.py', 'w') as file:
                file.write(code)

            return json.dumps(code)

        @app.route("/submit", methods=['POST'])
        def submit():
            ''' Posting a macrosequence to this endpoint will generate an ARTIQ
                experiment and execute it on the hardware using artiq_run.
            '''
            sequence = request.json
            code = generate_experiment(sequence, self.config)
            with open('generated_experiment.py', 'w') as file:
                file.write(code)
            env_name = self.config['environment_name']
            os.system(f'start "" cmd /k "call activate {env_name} & artiq_run generated_experiment.py --device-db {self.device_db}"')

            return json.dumps(code)

        @app.route("/channels")
        def channels():
            ''' Reads the device_db.py file to determine which RTIO channels
                are available.
            '''
            sys.path.append(self.device_db.split('device_db.py')[0])
            from device_db import device_db
            channel_dict = {'TTL': [], 'DAC': {}, 'DDS': [], 'ADC': [], 'cpld': []}

            for key, info in device_db.items():
                if 'module' not in info:
                    continue
                ignore = ['urukul', 'sampler', 'led', 'zotino']
                if info['class'] == 'TTLInOut' or info['class'] == 'TTLOut':
                    if any(x in key for x in ignore):
                        continue
                    channel_dict['TTL'].append(key)
                elif info['class'] in ['AD9910', 'AD9912']:
                    channel_dict['DDS'].append(key)
                elif info['class'] == 'Zotino':
                    channel_dict['DAC'][key] = list(range(32))
                elif info['class'] == 'Sampler':
                    channel_dict['ADC'].append(key)
                elif info['class'] == 'CPLD':
                    channel_dict['cpld'].append(key)
            return channel_dict

        @app.route("/variables", methods=['GET', 'POST'])
        def variables():
            if request.method == 'POST':
                for key, val in request.json.items():
                    self.variables[key] = val

            elif request.method == 'GET':
                return json.dumps(self.variables)

        @app.route("/version")
        def version():
            ''' Returns the current commit id '''
            return json.dumps(subprocess.check_output(["git", "rev-parse", "HEAD"], cwd=path).strip().decode())

        addr, port = self.config['addr'].split(':')
        app.run(host=addr, port=port, debug=True)

@click.command()
@click.option('--config', default='./config.yml', help='config path')
def main(config):
    ''' Hosts the webapp server. The app can be run by navigating to
        the address specified in the config file in a browser.
    '''
    app = App(config=config)

if __name__ == "__main__":
    main()
