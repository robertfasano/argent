from flask import Flask, request
from flask import render_template, send_from_directory
from flask_socketio import SocketIO, emit
from argent.generator import generate_experiment
from argent.scripts import find_scripts
from argent import Configurator
import json
import os
import click
import sys

class App:
    def __init__(self, device_db='./device_db.py', config='./config.yml'):
        self.device_db = device_db
        self.config = Configurator(config, device_db).load()
        self.variables = {}
        self.controls = {}

    def host(self, addr='127.0.0.1', port=8051):
        app = Flask(__name__)
        socketio = SocketIO(app)

        @app.route('/favicon.ico')
        def favicon():
            return send_from_directory(os.path.join(app.root_path, 'static'),
                                       'favicon.ico', mimetype='image/vnd.microsoft.icon')

        @app.route("/")
        def hello():
            return render_template('index.html', sequences=load(), channels=channels())

        @app.route("/scripts/list")
        def scripts():
            return json.dumps(find_scripts())

        @app.route("/generate", methods=['POST'])
        def generate():
            sequence = request.json
            code = generate_experiment(sequence)
            with open('generated_experiment.py', 'w') as file:
                file.write(code)

            return json.dumps(code)

        @app.route("/submit", methods=['POST'])
        def submit():
            sequence = request.json
            code = generate_experiment(sequence)
            with open('generated_experiment.py', 'w') as file:
                file.write(code)
            env_name = self.config['environment_name']
            os.system(f'start "" cmd /k "call activate {env_name} & artiq_run generated_experiment.py --device-db {self.device_db}"')

            return json.dumps(code)

        @app.route("/channels")
        def channels():
            sys.path.append(self.device_db.split('device_db.py')[0])
            from device_db import device_db
            channel_dict = {'TTL': [], 'DAC': [], 'DDS': [], 'ADC': []}

            for key, info in device_db.items():
                if 'module' not in info:
                    continue
                ignore = ['urukul', 'sampler', 'led', 'zotino']
                if info['class'] == 'TTLInOut' or info['class'] == 'TTLOut':
                    if any(x in key for x in ignore):
                        continue
                    channel_dict['TTL'].append(key)
                elif info['class'] == 'AD9912':
                    channel_dict['DDS'].append(key)
                elif info['class'] == 'Zotino':
                    channel_dict['DAC'].extend([f'{key}{i}' for i in range(32)])
                elif info['class'] == 'Sampler':
                    channel_dict['ADC'].append(key)

            return channel_dict

        @app.route("/config", methods=['GET', 'POST'])
        def config():
            if request.method == 'POST':
                for key, value in request.json.items():
                    self.config[key] = value
            return json.dumps(self.config)

        @app.route("/save", methods=['POST'])
        def save():
            path = self.config['sequence_library']
            with open(path, 'w') as file:
                json.dump(request.json, file, indent=2)
            return ''

        @app.route("/load")
        def load():
            path = self.config['sequence_library']
            try:
                with open(path, 'r') as file:
                    sequence = json.load(file)
            except:
                sequence = {}
            return json.dumps(sequence)

        @app.route("/variables", methods=['GET', 'POST', 'PATCH'])
        def variables():
            if request.method == 'POST':
                self.variables = request.json
                socketio.emit('variables', self.variables)

            if request.method == 'PATCH':
                for var, data in request.json.items():
                    if var in self.variables:
                        for key, field in data.items():
                            self.variables[var][key] = field
                    else:
                        self.variables[var] = data
                socketio.emit('variables', self.variables)
            return json.dumps(self.variables)

        @app.route("/variables/<name>", methods=['GET', 'POST'])
        def variable(name):
            if request.method == 'POST':
                self.variables[name]['value'] = request.json['value']
                socketio.emit('variables', self.variables)
            return json.dumps(self.variables)

        @app.route("/controls", methods=['GET', 'POST', 'PATCH'])
        def controls():
            if request.method == 'POST':
                self.controls = request.json
                socketio.emit('controls', self.controls)
            elif request.method == 'PATCH':
                for name, value in request.json.items():
                    self.controls[name] = value
                socketio.emit('controls', self.controls)

            return json.dumps(self.controls)

        @socketio.on('connect')
        def connect():
            emit('connect', {'data': 'Connected'})

        socketio.run(app, host=addr, port=port, debug=True)

@click.command()
@click.option('--device_db', default='./device_db.py', help='device_db path')
@click.option('--config', default='./config.yml', help='config path')
def main(device_db, config):
    print('Running Argent webapp...')
    print('Using device_db file at', os.path.abspath(device_db))
    print('Using config file at', os.path.abspath(config))
    app = App(device_db=device_db, config=config)
    app.host('127.0.0.1', 8051)

if __name__ == "__main__":
    main()
