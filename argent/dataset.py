import matplotlib.pyplot as plt
import pandas as pd
import numpy as np

class Dataset:
    def __init__(self, client, name=''):
        self.client = client
        self.start_time = None
        self.stop_time = None
        self._data = None
        self.name = name
        
        self.start()
        
    def start(self):
        if self.start_time is None:
            self.start_time = self.timestamp()
            self.client.record(self.name)
        else:
            raise Exception('Dataset has already been started!')
            
    def stop(self):
        if self.stop_time is None:
            self.stop_time = self.timestamp()
            self.client.record('')
        else:
            raise Exception('Dataset has already been stopped!')
        
    def timestamp(self):
        ''' Returns the timestamp of the most recent data point '''
        return self.client.data.index[-1]
    
    @property
    def data(self):            
        if self.stop_time is not None:
            self._data = self.client.data.loc[self.start_time:self.stop_time]
        else:
            self._data = self.client.data.loc[self.start_time::]
        return self._data.dropna(axis=1, how='all')

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

    def plot(self, x, y, z, xlabel='', ylabel='', zlabel='', fig=None, legend=True):
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

        for z0 in z_vals:
            subdata = concat[concat.z == z0]
            mean = subdata.groupby(subdata.x).mean()
            std = subdata.groupby(subdata.x).std()
            sterror = subdata.groupby(subdata.x).aggregate(lambda x: np.std(x, ddof=1)/np.sqrt(x.count()))
            plt.errorbar(mean.index, mean.y, sterror.y, capsize=4, linestyle='None', markersize=4, marker='o', label=f'{zlabel}={z0}')
            
        if legend:
            plt.legend()
        plt.xlabel(xlabel)
        plt.ylabel(ylabel)