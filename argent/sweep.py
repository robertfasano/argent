import numpy as np
from tqdm.auto import tqdm
import matplotlib.pyplot as plt
import pandas as pd
from argent.live_plot import LivePlot

class Sweep:
    def __init__(self, client, x, start, stop, steps, averages=1, sweeps=1, plot=None, legend=None):
        ''' Run a sweep across one or more variables.
            Arguments:
                client: handle to argent.Client
                x (str): name of independent variable to sweep
                start (float): beginning of sweep
                stop (float): end of sweep
                steps (int): number of steps in sweep
                averages (int): cycles to be repeated at each sweep point to gather statistics
                sweeps (int): number of sweeps to perform
                plot (str): a variable name can be passed to this argument to display a live plot
                legend (list): an optional second variable to iterate over. Should be a list with two elements,
                    where the first is the name of the variable and the second is the set of points to try. 
                    Example: legend=['z', (0, 1, 2, 3)]
        '''
        self.x = x
        self.start = start
        self.stop = stop
        self.steps = steps
        self.client = client
        self.sweeps = sweeps
        self.averages = averages  
        self.y = plot
        self.dataset = self.client.dataset()

        self.legend = legend

        if plot is not None:
            self.progress_plot = LivePlot(client, x, plot, xlim=[start, stop], legend=legend)
        self.run()

    def run(self):
        sweep_points = np.linspace(self.start, self.stop, self.steps)
        if self.y is None:
            sweep_points = tqdm(sweep_points)  # show progress bar is no variable is designated for plotting

        if self.legend is None:
            for _ in range(self.sweeps):
                for point in sweep_points:
                    self.client.set(self.x, point)
                    self.client.collect(self.averages)
                    self.progress_plot.update()
        else:
            for z0 in self.legend[1]:
                self.client.set(self.legend[0], z0)
                for _ in range(self.sweeps):
                    for point in sweep_points:
                        self.client.set(self.x, point)
                        self.client.collect(self.averages)
                        self.progress_plot.update()
        self.dataset.stop()

    def plot(self, y=None, fig=None, ylabel='', colors=None, style='errorbar'):
        if fig is None:
            fig = plt.figure(figsize=(9, 4.5), dpi=400)

        if y is None:
            y = self.y
            
        x = self.dataset.data[self.x]

        if type(y) == str:
            if ylabel == '':
                ylabel = y
            y = self.dataset.data[y]
        
        z = self.dataset.data['__stage__']
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
                plt.errorbar(mean.index, mean.y, sterror.y, capsize=4, linestyle='None', markersize=4, marker='o', label=f'Stage {z0}', color=color)
            elif style == 'line':
                plt.plot(mean.index, mean.y, color=color, label=f'Stage {z0}') 
                
        plt.ylabel(ylabel)
        plt.xlabel(self.x)
        
        return self