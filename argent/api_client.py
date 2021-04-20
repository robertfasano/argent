import socketio
from multiprocessing import SimpleQueue
import pandas as pd
import requests
from labAPI import Environment 
import datetime 

class Client:
    def __init__(self, address='127.0.0.1:8051'):
        self.address = address
#         self.queue = SimpleQueue()
        self.client = socketio.Client()
        self.paths = {}
        
        @self.client.on('heartbeat')
        def heartbeat(results):
            data = {**results['inputs'], **results['outputs']}
#             self.queue.put(pd.DataFrame(data, index=[results['timestamp']]))

            payload = {}
            for var, path in self.paths.items():
                payload[path] = data[var]

                with Environment.lookup(path) as parameter:
                    # parameter.set(data[var])
                    parameter.value = data[var]

            with Environment.handle() as env:
                timestamp = datetime.datetime.fromisoformat(results['timestamp'])
                for path, value in payload.items():
                    env.monitor.data.loc[timestamp, path] = value

                
        self.client.connect(f'http://{self.address}')

#     def measure(self):
#         data = pd.DataFrame()
#         while not self.queue.empty():
#             data = data.append(self.queue.get(), sort=False)
#         return data

    def get(self, name):
        try:
            return requests.get(f"http://{self.address}/results").json()['outputs'][name]
        except:
            return None

    def set(self, name, value):
        requests.post(f"http://{self.address}/inputs", json={name: value})
        
    def register(self, path, variable):
        self.paths[variable] = path