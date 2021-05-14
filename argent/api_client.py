import socketio
from multiprocessing import SimpleQueue
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
            self.data = self.data.append(pd.DataFrame(data, index=[timestamp]))
  
        self.client.connect(f'http://{self.address}')

    def dataset(self):
        return Dataset(self)

    def get(self, name):
        try:
            return requests.get(f"http://{self.address}/results").json()['outputs'][name]
        except:
            return None

    def set(self, name, value):
        requests.post(f"http://{self.address}/inputs", json={name: value})
        
    def sweep(self, var, min, max, steps, points=1):
        sweep_points = np.linspace(min, max, steps)
        for point in tqdm(sweep_points):
            cycle = self.data['__cycle__'].iloc[-1]
            self.set(var, point)
            
            while self.data['__cycle__'].iloc[-1] - cycle < points:
                continue