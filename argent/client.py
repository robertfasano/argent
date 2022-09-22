''' The Client class offers many methods for interacting with the experiment. 

    Instantiating a client:
        from argent import Client
        client = Client('127.0.0.1:8051')    # pass your server address where the web interface runs

    Setting and getting variables:
        client.set('x', 100)      # set the variable 'x' to 100
        print(client.get('x'))    # query the server for the variable 'x' and print the value

    Creating a Dataset (see dataset.py):
        ds = client.dataset()

    Creating a Sweep (see sweep.py):
        sweep = client.sweep('detuning', -150, 150, 100)

    Clear the experimental queue (e.g. to abort a sweep early):
        client.stop()
'''

import socketio
import pandas as pd
import numpy as np
import requests
import datetime 
import json
from .dataset import Dataset
from .sweep import Sweep

class Client:
    ''' A client for a Flask-SocketIO server '''
    def __init__(self, address='127.0.0.1:8051'):
        self.address = address
        self.client = socketio.Client()        
        self.data = pd.DataFrame()
        self.callbacks = {}

        @self.client.on('heartbeat')
        def heartbeat(results):
            data = {**results['variables']}
            timestamp = datetime.datetime.fromisoformat(results['timestamp'])
            data['__stage__'] = results['stage']
            data['__cycle__'] = results['cycle']
            new_data = pd.DataFrame(data, index=[timestamp])
            self.data = self.data.append(new_data)

            for callback in self.callbacks.values():
                callback(new_data)

        self.client.connect(f'http://{self.address}')

    def config(self):
        ''' Load the config file currently used by the server '''
        return json.loads(requests.get(f'http://{self.address}/config').text)

    def dataset(self):
        return Dataset(self)

    def get(self, name):
        results = requests.get(f"http://{self.address}/results").json()
        if name in results['variables']:
            return results['variables'][name]
        else:
            return None

    def post(self, endpoint, json_data):
        requests.post(f"http://{self.address}{endpoint}", json=json_data)

    def mock(self, config='./config.yml'):
        ''' Simulate a live experiment for testing. '''
        from threading import Thread
        import time

        self.post('/variables', {'x': 1, 'A': 1})
        
        self.mock_active = True

        def mock_results(self):
            i = 0
            while self.mock_active:
                x = requests.get(f"http://{self.address}/variables").json()['x']
                A = requests.get(f"http://{self.address}/variables").json()['A']

                payload = {'stage': 0, 'cycle': i, 'timestamp': datetime.datetime.now().isoformat(),
                           'variables': {'x': x, 'A': A, 'y': A*np.exp(-x) + np.random.normal(0, 0.01)},
                          }
                self.post('/results', payload)
                i += 1
                time.sleep(0.25)

        Thread(target=mock_results, args=(self,)).start()

    def run_id(self):
        return float(requests.get(f'http://{self.address}/run_id').text)

    def set(self, name, value, save=False):
        if self.get(name) is None:
            raise Exception(f'Variable {name} does not exist!')
        self.post('/variables', {name: value})

        if save:
            self.post('/variables/default', {name: value})

    def sweep(self, x, start, stop, steps, sweeps=1, plot=None, legend=None):
        return Sweep(self, x, start, stop, steps, sweeps=sweeps, plot=plot, legend=legend)

    def stop(self):
        ''' Clear the experimental queue '''
        self.post('/queue', {'mode': 'write', 'values': []})


