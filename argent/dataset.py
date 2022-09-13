import matplotlib.pyplot as plt
import pandas as pd
import numpy as np
import json
import requests

class Dataset:
    def __init__(self, client, name=''):
        self.client = client
        self.start_time = None
        self.stop_time = None
        self._data = None
        self.name = name
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

    def plot(self, x, y, z, xlabel='', ylabel='', zlabel='', fig=None, legend=True, colors=None, style='errorbar'):
        if fig is None:
            fig = plt.figure(figsize=(9, 6), dpi=400)

        if type(x) == str:
            if xlabel == '':
                xlabel = x
            x = self.pivot(x, 0)

        if type(y) == str:
            if ylabel == '':
                ylabel = y
            y = self.pivot(y, 0)
            
        if type(z) == str:
            if zlabel == '':
                zlabel = z
            z = self.pivot(z, 0)
            
        z_vals = z.unique()
        concat = pd.concat([x, y, z], axis=1).dropna()
        concat.columns = ['x', 'y', 'z']

        for i, z0 in enumerate(z_vals):
            subdata = concat[concat.z == z0]
            mean = subdata.groupby(subdata.x).mean()
            std = subdata.groupby(subdata.x).std()
            sterror = subdata.groupby(subdata.x).aggregate(lambda x: np.std(x, ddof=1)/np.sqrt(x.count()))

            color = None
            if colors is not None:
                color = colors[i]
            if style == 'errorbar':
                plt.errorbar(mean.index, mean.y, sterror.y, capsize=4, linestyle='None', markersize=4, marker='o', label=f'{zlabel}={z0}', color=color)
            elif style == 'line':
                plt.plot(mean.index, mean.y, color=color, label=f'{zlabel}={z0}')

        if legend:
            plt.legend()
        plt.xlabel(xlabel)
        plt.ylabel(ylabel)