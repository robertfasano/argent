import socketio
import pandas as pd
import requests
import datetime 
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
            data = {**results['variables'], **results['parameters']}
            timestamp = datetime.datetime.fromisoformat(results['timestamp'])
            data['__stage__'] = results['stage']
            data['__cycle__'] = results['cycle']
            new_data = pd.DataFrame(data, index=[timestamp])
            self.data = self.data.append(new_data)

            for callback in self.callbacks.values():
                callback(new_data)

        self.client.connect(f'http://{self.address}')

    def collect(self, points):
        ''' Block until a certain number of points have been collected '''
        cycle = self.data['__cycle__'].iloc[-1]

        while self.data['__cycle__'].iloc[-1] - cycle < points:
            continue

        return self.data.iloc[-points::]

    def dataset(self, name=''):
        return Dataset(self, name=name)

    def get(self, name):
        results = requests.get(f"http://{self.address}/results").json()
        if name in results['parameters']:
            return results['parameters'][name]
        if name in results['variables']:
            return results['variables'][name]
        else:
            return None

    def record(self, name):
        requests.post(f"http://{self.address}/record", json={"__run__": name})

    def set(self, name, value):
        if self.get(name) is None:
            raise Exception(f'Variable {name} does not exist!')
        requests.post(f"http://{self.address}/variables", json={name: value})

    def sweep(self, x, start, stop, steps, averages=1, sweeps=1, plot=None):
        return Sweep(self, x, start, stop, steps, averages=averages, sweeps=sweeps, plot=plot)
