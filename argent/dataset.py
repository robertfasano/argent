''' The Dataset class is a tool for receiving and manipulating data from the experiment. Usage example:
        from argent import Client
        client = Client('127.0.0.1:8051')    
        ds = client.dataset()
        ds.collect()
    This instantiates a dataset and starts collecting data from the experiment by setting a run_id flag
    on the server matching the run_id of the Dataset instance. To stop the run, just call
        ds.stop()
    or create a new Dataset. You can also pass a number to collect() to only gather a specified number of 
    points. 
    
    Multiple Datasets can be started and stopped seamlessly. For example:
        ds1 = client.dataset()      # instantiate first dataset
        ds1.collect(5)              # store 5 points in first dataset
        ---
        ds2 = client.dataset()      # instantiate second dataset
        ds2.collect(10)             # store 10 points in second dataset
        ---
        ds1.collect(5)              # store 5 more points in first dataset
    Note that Dataset.collect() does not block the kernel, so if you call ds2.collect() before ds1.collect() finishes,
    ds1.collect() will terminate early rather than collecting specified number of points.

    Data is stored in a pandas DataFrame and accessible with the .data property:
        print(ds1.data)

    You can generate errorbar plots of two variables with the syntax
        ds1.plot(x, y)
    where x and y are two strings corresponding to columns of the dataset.
'''
import matplotlib.pyplot as plt
import pandas as pd
import numpy as np
import json
import requests
from argent.live_plot import LivePlot
import time

class Dataset:
    def __init__(self, client, plot=None):
        self.client = client
        self._data = None
        self.increment_max_run_id()
        self.run_id = self.get_max_run_id()
        self.plotter = None
        self.y = plot

    def collect(self, N=None, plot=None):
        ''' Create a dataset and average N points '''
        self.set_run_id(self.run_id)
        if N is not None:   # collect a specified number of points; otherwise, run until the stop() method is called or a new Dataset is started
            self.client.post('/queue', {'mode': 'write', 'values': [{}]*N})
        self.run()

    def stop(self):
        self.set_run_id(0.0)
        
    def wait_for_next_point(self):
        data_length = len(self.data)
        while True:
            new_length = len(self.data)
            if new_length == data_length:
                time.sleep(0.01)
                continue
            else:
                return

    def get_run_id(self):
        ''' Returns an integer labeling the last run_id submitted to the server '''
        return float(json.loads(requests.get(f"http://{self.client.address}/run_id").text))

    def get_max_run_id(self):
        ''' Returns an integer labeling the last run_id submitted to the server '''
        return float(json.loads(requests.get(f"http://{self.client.address}/max_run_id").text))

    def increment_max_run_id(self):
        ''' Returns an integer labeling the last run_id submitted to the server '''
        requests.post(f"http://{self.client.address}/max_run_id")

    def set_run_id(self, id):
        requests.post(f"http://{self.client.address}/run_id", json={'run_id': str(id)})

    @classmethod
    def load(self, filename):
        df = pd.read_csv(filename, index_col=0)
        df.index = pd.DatetimeIndex(df.index)
        return df

    @property
    def active(self):
        ''' Returns True if the run is still active and False otherwise '''
        return self.run_id == self.client.run_id()

    @property
    def data(self):
        if len(self.client.data) == 0:
            return self.client.data
        self._data = self.client.data[self.client.data['__run_id__'] == self.run_id]
        return self._data

    def pivot(self, var, stage=None):
        ''' Returns a pivot table of a variable with different columns for each stage. If a stage
            is passed, only that stage is returned. 
        '''
        data = self.data.dropna(subset=[var, '__stage__'])
        data = data.astype({var: float, '__stage__': int})
        data = data.set_index('__cycle__')[[var, '__stage__']]
        pivot = pd.pivot_table(data, values=var, index='__cycle__', columns='__stage__')
        if stage is not None: 
            pivot = pivot[stage]
        return pivot.dropna()

    def plot(self, x, y, legend=None):
        ''' Convenience function for plotting sweep data with variables other than the instantiated x and y choices '''
        if legend is None:
            legend = [None, []]
        self.plotter = LivePlot(self, x, y, legend=legend)
        self.plotter.update()

    def run(self):
        if self.plotter is None:
            return
        while True:
            try:
                self.wait_for_next_point()
                self.plotter.update()
                if not self.active:
                    break
            except KeyboardInterrupt:
                self.client.stop()
                break

