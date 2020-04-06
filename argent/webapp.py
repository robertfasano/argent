from flask import Flask, request
from flask import render_template, send_from_directory
from argent.webapp_generator import generate_experiment
from argent.scripts import find_scripts
from argent import Configurator
import json
import os

def host(addr='127.0.0.1', port=8051):
    app = Flask(__name__)

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

    @app.route("/submit", methods=['POST'])
    def submit():
        sequence = request.json
        code = generate_experiment(sequence)
        with open('generated_experiment.py', 'w') as file:
            file.write(code)
        os.system('artiq_run generated_experiment.py')
        return json.dumps(code)

    @app.route("/config", methods=['GET', 'POST'])
    def config():
        if request.method == 'POST':
            for key, value in request.json.items():
                Configurator.update(key, value)
        return json.dumps(Configurator.load())

    @app.route("/save", methods=['POST'])
    def save():
        path = Configurator.load('sequences_path')[0]
        with open(path, 'w') as file:
            json.dump(request.json, file, indent=2)
        return ''

    @app.route("/load")
    def load():
        path = Configurator.load('sequences_path')[0]
        try:
            with open(path, 'r') as file:
                sequence = json.load(file)
        except:
            sequence = {}
        return json.dumps(sequence)

    app.run(debug=True, host=addr, port=port)

if __name__ == "__main__":
    host('127.0.0.1', 8051)
