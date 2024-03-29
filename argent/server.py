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
        print('Using config file at', os.path.abspath(config))
        self.config = Configurator(config).load()
        self.device_db = self.config['device_db']
        print('Using device_db at', os.path.abspath(self.device_db))

        self.addr, self.port = self.config['addr'].split(':')

        print(f'Starting Argent server at {self.addr}:{self.port}.')

        ## load InfluxDB client if specified
        if 'influx' in self.config:
            self.influx = InfluxDBClient(self.config['influx'])

        self.processes = []
        self.variables = {}
        self.results = {'variables': {}}
        self.queued_points = []
        self.run_id = 0.0
        self.max_run_id = 0.0
        self.sweeping = False
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
                                   channels=self.config['channels']
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
            try:
                code = generate_experiment(sequence, self.config, pid, variables)
            except Exception as e:
                self.socketio.emit('message', {'message': str(e), 'variant': 'error'})
                print('Sequence generation exception:', str(e))
                return
            with open('generated_experiment.py', 'w') as file:
                file.write(code)
            self.socketio.emit('message', {'message': 'Sequence generated.', 'variant': 'success'})

            return json.dumps(code)

        @self.app.route("/submit", methods=['POST'])
        def submit():
            ''' Posting a playlist to this endpoint will generate an ARTIQ
                experiment and execute it on the hardware using artiq_run.
            '''
            sequence = request.json['playlist']
            pid = request.json['pid']
            variables = request.json['variables']
            variables['__run_id__'] = {'value': self.run_id, 'sync': True}
            try:
                code = generate_experiment(sequence, self.config, pid, variables)
            except Exception as e:
                self.socketio.emit('message', {'message': str(e), 'variant': 'error'})
                print('Sequence generation exception:', str(e))
                return
            with open('generated_experiment.py', 'w') as file:
                file.write(code)
            env_name = self.config['environment_name']
            proc = subprocess.Popen(f'cmd /k "call activate {env_name} & artiq_run generated_experiment.py --device-db {self.device_db}"', creationflags=subprocess.CREATE_NEW_CONSOLE)
            self.processes.append(proc)
            if len(self.processes) >= 3:
                self.processes[0].terminate()
                self.processes.pop(0)
            self.socketio.emit('message', {'message': 'Sequence generated.', 'variant': 'success'})

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
                    if isinstance(val, dict):
                        self.variables[key] = val
                    elif isinstance(val, float) or isinstance(val, int):
                        self.variables[key]['value'] = float(val)

                return ''

            elif request.method == 'GET':
                vars = self.variables
                source = request.args.get('source', default=None)

                if source == 'ARTIQ':
                    if len(self.queued_points) > 0:
                        self.sweeping = True
                        point = self.queued_points.pop(0)
                        print(point)
                        for key, val in point.items():
                            vars[key]['value'] = val
                        
                    else:
                        if self.sweeping:   # run has ended, reset run_id
                            self.sweeping = False
                            self.run_id = 0.0
                vars['__run_id__'] = {'value': self.run_id}
                return json.dumps(vars)

        @self.app.route("/variables/default", methods=['POST'])
        def defaults():
            print('updating default variable', request.json)
            self.socketio.emit('default', request.json)

        @self.app.route("/results", methods=['GET', 'POST'])
        def results():
            if request.method == 'POST':
                for key, val in request.json.items():
                    self.results[key] = val

                self.socketio.emit('heartbeat', request.json)

                ## write data to Influx
                results = request.json
                data = {**results['variables']}
                timestamp = datetime.datetime.fromisoformat(results['timestamp'])
                data['__stage__'] = results['stage']
                data['__cycle__'] = results['cycle']

                if 'influx' in self.config:
                    new_data = pd.DataFrame(data, index=[timestamp])
                    self.influx.write(new_data)

                return ''

            elif request.method == 'GET':
                return json.dumps(self.results)

        @self.app.route("/run_id", methods=['GET', 'POST'])
        def run_id():
            if request.method == 'POST':
                self.run_id = float(request.json['run_id'])
                # if self.run_id > self.max_run_id:
                #     self.max_run_id = self.run_id
            return str(self.run_id)

        @self.app.route("/max_run_id", methods=['GET', 'POST'])
        def max_run_id():
            if request.method == 'POST':
                self.max_run_id += 1
            return str(self.max_run_id)
            
        @self.app.route("/sweep", methods=['GET', 'POST'])
        def sweep(): 
            if request.method == 'POST':
                if request.json['legend_name'] is not None:
                    for z in request.json['legend_values']:
                        for i in range(request.json['sweeps']):
                            for x in request.json['values']:
                                point = {request.json['legend_name']: z, request.json['name']: x}
                                self.queued_points.append(point)
                else:
                    for i in range(request.json['sweeps']):
                        for x in request.json['values']:
                            point = {request.json['name']: x}
                            self.queued_points.append(point)

            return json.dumps(len(self.queued_points) > 0)

 
        @self.app.route("/queue", methods=['GET', 'POST'])
        def queue():
            ''' Allows experimental points to be queued in advance '''
            if request.method == 'POST':
                mode = request.json.get('mode', 'append')
                if mode == 'append':
                    self.queued_points.extend(request.json['values'])
                elif mode == 'write':
                    self.queued_points = request.json['values']

            return json.dumps(self.queued_points)           

        @self.app.route("/heartbeat", methods=['POST'])
        def heartbeat():
            self.socketio.emit('heartbeat', self.results)
            return ''

    def host(self):
        self.socketio.run(self.app, host=self.addr, port=int(self.port), debug=False)

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
