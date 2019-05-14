from flask import Flask, request
from flask import render_template
import json
import threading
import numpy as np
import os
from pint import UnitRegistry
ureg = UnitRegistry()
Q_ = ureg.Quantity

# creates a Flask application, named app
app = Flask(__name__)

# a route where we will display a welcome message via an HTML template
@app.route("/")
def hello():
    message = "Hello, World"
    return render_template('index.html', message=message)

@app.route("/get")
def get():
    message = "Hello, World"
    return message

@app.route("/loopback", methods=['POST'])
def loopback():
    return json.dumps(request.get_json())

@app.route("/channels")
def list_channels():
    from config import channels
    return json.dumps(channels)

@app.route("/convert/<text>", methods=['GET'])
def convert(text):
    if text == '':
        return ''
    duration = Q_(text)
    if str(duration.units) == 'dimensionless':
        duration = Q_('{} {}'.format(duration.magnitude, 's'))    # assume base unit if none is passed
    cleaned_value = duration.to_compact()                   # auto-convert units for compact view
    cleaned_value = np.round(cleaned_value, 9)              # round to 9 digits to remove numerical rounding errors in Python
    return '{:~}'.format(cleaned_value)

# @app.route("/start", methods=['POST'])
# def start():
#     sequence = request.get_json()['payload']
#     for step in sequence:
#         qty = Q_(step['duration'])
#         qty.ito_base_units()
#         step['duration'] = qty.magnitude
#
#         for i in range(len(step['DDS'])):
#             freq = Q_(step['DDS'][i]['frequency'])
#             freq.ito_base_units()
#             step['DDS'][i]['frequency'] = freq.magnitude
#             step['DDS'][i]['attenuation'] = float(step['DDS'][i]['attenuation'])
#     with open('sequence.json', 'w') as file:
#         json.dump(sequence, file)
#     os.system('start "" cmd /k "cd /argent/argent/ & call activate artiq-4 & artiq_run sequencer_loop.py"')
#     return ''

@app.route("/start", methods=['POST'])
def start():
    sequence = request.get_json()['payload']
    for step in sequence:
        qty = Q_(step['duration'])
        qty.ito_base_units()
        step['duration'] = qty.magnitude

        for i in range(len(step['DDS'])):
            freq = Q_(step['DDS'][i]['frequency'])
            freq.ito_base_units()
            step['DDS'][i]['frequency'] = freq.magnitude
            step['DDS'][i]['attenuation'] = float(step['DDS'][i]['attenuation'])

        for i in range(len(step['DAC'])):
            V = Q_(step['DAC'][i])
            V.ito_base_units()
            step['DAC'][i] = V.magnitude

    with open('sequence.json', 'w') as file:
        json.dump(sequence, file)

    from generator import write_preloop, write_loop
    write_preloop(sequence)
    write_loop(sequence)
    os.system('start "" cmd /k "cd /argent/argent/ & call activate artiq-4 & artiq_run base_experiment.py"')
    return ''


@app.route("/save", methods=['POST'])
def save():
    sequence = request.get_json()['payload']
    with open('saved.json', 'w') as file:
        json.dump(sequence, file)
    return ''

@app.route("/load")
def load():
    with open('saved.json', 'r') as file:
        sequence = json.load(file)
    return json.dumps(sequence)



# run the application
if __name__ == "__main__":
#    thread = threading.Thread(target=app.run)
#    thread.start()
    app.run(debug=True, port=8051)
