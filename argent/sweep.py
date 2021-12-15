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

    def save(self, filename):
        self.dataset.data.to_csv(filename)