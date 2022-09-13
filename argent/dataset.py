import matplotlib.pyplot as plt
import pandas as pd
import numpy as np
import json
import requests
from argent.live_plot import LivePlot

class Dataset:
    def __init__(self, client):
        self.client = client
        self._data = None
        self.run_id = self.get_run_id() + 1
        self.set_run_id(self.run_id)
    
    def get_run_id(self):
        ''' Returns an integer labeling the last run_id submitted to the server '''
        return float(json.loads(requests.get(f"http://{self.client.address}/max_run_id").text))

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
        if self.get_run_id() == self.run_id:        ## experiment is still running, update the dataset
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

