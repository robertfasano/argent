import json
import os
import sys
import click
import datetime
import subprocess
import pandas as pd
from flask import Flask, request
from flask import render_template, send_from_directory
from flask_socketio import SocketIO
from argent.generator.generator import generate_experiment
from argent import Configurator, path
from .influx import InfluxDBClient

class App:
    ''' Handles the server backend which forms the link between the webapp client
        and the code generator/ARTIQ experiment submission. 
    '''
    def __init__(self, config='./config.yml'):
        print('Running Argent webapp...')
        print('Using config file at', os.path.abspath(config))
        self.config = Configurator(config).load()
        self.device_db = self.config['device_db']
        print('Using device_db at', os.path.abspath(self.device_db))

        ## load InfluxDB client if specified
        if 'influx' in self.config:
            self.influx = InfluxDBClient(self.config['influx'])

        self.variables = {}
        self.parameters = {}
        self.results = {'variables': {}, 'parameters': {}}

        self.app = Flask(__name__)
        self.socketio = SocketIO(self.app)

        @self.app.route('/favicon.ico')
        def favicon():
            ''' Provides the ARTIQ tab icon '''
            return send_from_directory(os.path.join(self.app.root_path, 'static'),
                                       'favicon.ico', mimetype='image/vnd.microsoft.icon')

        @self.app.route("/")
        def hello():
            ''' The main entrypoint for the webapp '''
            return render_template('index.html',
                                   sequences=json.dumps({}),
                                   channels=self.config['channels'],
                                   version=version()
                                  )

        @self.app.route("/config")
        def get_config():
            return json.dumps(self.config)

        @self.app.route("/generate", methods=['POST'])
        def generate():
            ''' Posting a playlist to this endpoint will trigger code
                generation. The experiment will not be sent to the hardware.
            '''
            sequence = request.json['playlist']
            pid = request.json['pid']
            variables = request.json['variables']
            parameters = request.json['parameters']

            return json.dumps(code)

        @self.app.route("/submit", methods=['POST'])
        def submit():
            ''' Posting a playlist to this endpoint will generate an ARTIQ
                experiment and execute it on the hardware using artiq_run.
            '''
            sequence = request.json['playlist']
            pid = request.json['pid']
            variables = request.json['variables']
            parameters = request.json['parameters']
            code = generate_experiment(sequence, self.config, pid, variables, parameters)
            with open('generated_experiment.py', 'w') as file:
                file.write(code)
            env_name = self.config['environment_name']
            os.system(f'start "" cmd /k "call activate {env_name} & artiq_run generated_experiment.py --device-db {self.device_db}"')

            return json.dumps(code)

        @self.app.route("/channels")
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
                    channel_dict['DAC'][key] = [key+str(x) for x in range(32)]
                elif info['class'] == 'Sampler':
                    channel_dict['ADC'].append(key)
                elif info['class'] == 'CPLD':
                    channel_dict['cpld'].append(key)
            return channel_dict

        @self.app.route("/variables", methods=['GET', 'POST'])
        def variables():
            if request.method == 'POST':
                for key, val in request.json.items():
                    self.variables[key] = val

                return ''

            elif request.method == 'GET':
                return json.dumps(self.variables)

        @self.app.route("/parameters", methods=['GET', 'POST'])
        def parameters():
            if request.method == 'POST':
                for key, val in request.json.items():
                    self.parameters[key] = val

                self.socketio.emit('heartbeat', {"pid": request.json['pid']})
                return ''

            elif request.method == 'GET':
                return json.dumps(self.parameters)

        @self.app.route("/results", methods=['GET', 'POST'])
        def results():
            if request.method == 'POST':
                for key, val in request.json.items():
                    self.results[key] = val

                self.socketio.emit('heartbeat', request.json)

                ## write data to Influx
                results = request.json
                data = {**results['variables'], **results['parameters']}
                timestamp = datetime.datetime.fromisoformat(results['timestamp'])
                data['__stage__'] = results['stage']
                data['__cycle__'] = results['cycle']

                if 'influx' in self.config:
                    new_data = pd.DataFrame(data, index=[timestamp])
                    self.influx.write(new_data, self.config['influx']['bucket'])

                return ''

            elif request.method == 'GET':
                return json.dumps(self.results)

        @self.app.route("/heartbeat", methods=['POST'])
        def heartbeat():
            self.socketio.emit('heartbeat', self.results)
            return ''

        @self.app.route("/version")
        def version():
            ''' Returns the current commit id '''
            return json.dumps(subprocess.check_output(["git", "rev-parse", "HEAD"], cwd=path).strip().decode())

    def host(self):
        addr, port = self.config['addr'].split(':')
        self.socketio.run(self.app, host=addr, port=int(port), debug=False)

@click.command()
@click.option('--config', default='./config.yml', help='config path')
def main(config):
    ''' Hosts the webapp server. The app can be run by navigating to
        the address specified in the config file in a browser.
    '''
    app = App(config=config)
    app.host()

if __name__ == "__main__":
    main()
