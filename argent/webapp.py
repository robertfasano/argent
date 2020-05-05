from flask import Flask, request
from flask import render_template, send_from_directory
from flask_socketio import SocketIO, emit
from argent.webapp_generator import generate_experiment
from argent.scripts import find_scripts
from argent import Configurator
import json
import os

class App:
    def __init__(self):
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
            return render_template('index.html', sequences=load())

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
            os.system('start "" cmd /k "call activate artiq-4 & artiq_run generated_experiment.py"')

            return json.dumps(code)

        @app.route("/config", methods=['GET', 'POST'])
        def config():
            if request.method == 'POST':
                for key, value in request.json.items():
                    Configurator.update(key, value)
            return json.dumps(Configurator.load())

        @app.route("/save", methods=['POST'])
        def save():
            path = Configurator.load('sequence_library')[0]
            with open(path, 'w') as file:
                json.dump(request.json, file, indent=2)
            return ''

        @app.route("/load")
        def load():
            path = Configurator.load('sequence_library')[0]
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

        @app.route("/controls", methods=['GET', 'POST'])
        def controls():
            if request.method == 'POST':
                self.controls = request.json
                socketio.emit('controls', self.controls)
            return json.dumps(self.controls)

        @socketio.on('connect')
        def connect():
            emit('connect', {'data': 'Connected'})

        socketio.run(app, host=addr, port=port, debug=True)
if __name__ == "__main__":
    app = App()
    app.host('127.0.0.1', 8051)
