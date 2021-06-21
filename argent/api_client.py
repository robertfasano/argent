import socketio
import pandas as pd
import numpy as np
import requests
import datetime 
from .dataset import Dataset
from tqdm.auto import tqdm

class Client:
    ''' A client for a Flask-SocketIO server '''
    def __init__(self, address='127.0.0.1:8051'):
        self.address = address
        self.client = socketio.Client()        
        self.data = pd.DataFrame()

        @self.client.on('heartbeat')
        def heartbeat(results):
            data = {**results['inputs'], **results['outputs']}
            timestamp = datetime.datetime.fromisoformat(results['timestamp'])
            data['__stage__'] = results['stage']
            data['__cycle__'] = results['cycle']
            new_data = pd.DataFrame(data, index=[timestamp])
            self.data = self.data.append(new_data)

        self.client.connect(f'http://{self.address}')

    def dataset(self, name=''):
        return Dataset(self, name=name)

    def get(self, name):
        try:
            return requests.get(f"http://{self.address}/results").json()['outputs'][name]
        except:
            return None

    def record(self, name):
        requests.post(f"http://{self.address}/record", json={"__run__": name})

    def set(self, name, value):
        requests.post(f"http://{self.address}/inputs", json={name: value})
        
    def sweep(self, var, min, max, steps, points=1, sweeps=1):
        sweep_points = np.linspace(min, max, steps)
        for sweep in range(sweeps):
            for point in tqdm(sweep_points):
                self.set(var, point)
                self.collect(points)

    def collect(self, points):
        ''' Block until a certain number of points have been collected '''
        cycle = self.data['__cycle__'].iloc[-1]

        while self.data['__cycle__'].iloc[-1] - cycle < points:
            continue