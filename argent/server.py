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
        self.influx = InfluxDBClient(self.config['influx'])

        self.inputs = {}
        self.outputs = {}
        self.results = {'inputs': {}, 'outputs': {}}
        self.__run__ = ''

        self.host()


    def host(self):
        ''' Run the Flask server on a given address and port '''
        app = Flask(__name__)
        socketio = SocketIO(app)

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
                                   channels=self.config['channels'],
                                   version=version()
                                  )

        @app.route("/config")
        def get_config():
            return json.dumps(self.config)

        @app.route("/generate", methods=['POST'])
        def generate():
            ''' Posting a playlist to this endpoint will trigger code
                generation. The experiment will not be sent to the hardware.
            '''
            sequence = request.json['playlist']
            pid = request.json['pid']
            inputs = request.json['inputs']
            outputs = request.json['outputs']
            variables = request.json['variables']
            code = generate_experiment(sequence, self.config, pid, inputs, outputs, variables)            
            with open('generated_experiment.py', 'w') as file:
                file.write(code)

            return json.dumps(code)

        @app.route("/record", methods=['POST'])
        def record():
            ''' POST to this endpoint to start saving data in a named run '''
            self.__run__ = request.json['__run__']

        @app.route("/submit", methods=['POST'])
        def submit():
            ''' Posting a playlist to this endpoint will generate an ARTIQ
                experiment and execute it on the hardware using artiq_run.
            '''
            sequence = request.json['playlist']
            pid = request.json['pid']
            inputs = request.json['inputs']
            outputs = request.json['outputs']
            code = generate_experiment(sequence, self.config, pid, inputs, outputs)
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
                    channel_dict['DAC'][key] = [key+str(x) for x in range(32)]
                elif info['class'] == 'Sampler':
                    channel_dict['ADC'].append(key)
                elif info['class'] == 'CPLD':
                    channel_dict['cpld'].append(key)
            return channel_dict

        @app.route("/inputs", methods=['GET', 'POST'])
        def inputs():
            if request.method == 'POST':
                for key, val in request.json.items():
                    self.inputs[key] = val

                return ''

            elif request.method == 'GET':
                return json.dumps(self.inputs)

        @app.route("/outputs", methods=['GET', 'POST'])
        def outputs():
            if request.method == 'POST':
                for key, val in request.json.items():
                    self.outputs[key] = val

                socketio.emit('heartbeat', {"pid": request.json['pid']})
                return ''

            elif request.method == 'GET':
                return json.dumps(self.outputs)

        @app.route("/results", methods=['GET', 'POST'])
        def results():
            if request.method == 'POST':
                for key, val in request.json.items():
                    self.results[key] = val

                socketio.emit('heartbeat', request.json)

                ## write data to Influx
                results = request.json
                data = {**results['inputs'], **results['outputs']}
                timestamp = datetime.datetime.fromisoformat(results['timestamp'])
                data['__stage__'] = results['stage']
                data['__cycle__'] = results['cycle']

                
                new_data = pd.DataFrame(data, index=[timestamp])
                if self.__run__ != '':
                    new_data['__run__'] = self.__run__
                    self.influx.write(new_data, self.config['influx']['data_bucket'])
                self.influx.write(new_data, self.config['influx']['master_bucket'])

                return ''

            elif request.method == 'GET':
                return json.dumps(self.results)

        @app.route("/heartbeat", methods=['POST'])
        def heartbeat():
            socketio.emit('heartbeat', self.results)
            return ''

        @app.route("/version")
        def version():
            ''' Returns the current commit id '''
            return json.dumps(subprocess.check_output(["git", "rev-parse", "HEAD"], cwd=path).strip().decode())

        addr, port = self.config['addr'].split(':')
        # app.run(host=addr, port=port, debug=True)
        socketio.run(app, host=addr, port=int(port), debug=False)

@click.command()
@click.option('--config', default='./config.yml', help='config path')
def main(config):
    ''' Hosts the webapp server. The app can be run by navigating to
        the address specified in the config file in a browser.
    '''
    app = App(config=config)

if __name__ == "__main__":
    main()
