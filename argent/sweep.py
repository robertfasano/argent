import numpy as np
from argent.live_plot import LivePlot
from argent.dataset import Dataset
import time

class Sweep(Dataset):
    def __init__(self, client, x, start, stop, steps, sweeps=1, plot=None, legend=None):
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
        super().__init__(client)
        self.x = x
        self.start = start
        self.stop = stop
        self.steps = steps
        self.sweeps = sweeps
        self.y = plot
        self.legend = legend
        if self.legend is None:
            self.legend = [None, []]

        self.run()

    def plot(self, x=None, y=None, legend=None):
        super().plot(x or self.x, y or self.y, legend or [None, []])

    def run(self):
        if self.y is not None:
            self.progress_plot = LivePlot(self, self.x, self.y, xlim=[self.start, self.stop], legend=self.legend)

        sweep_points = list(np.linspace(self.start, self.stop, self.steps))
        self.client.post('/sweep', {'name': self.x, 'values': sweep_points, 'legend_name': self.legend[0], 'legend_values': self.legend[1], 'sweeps': self.sweeps, 'run_id': self.run_id})
        data_length = len(self.data)
       
        while True:
            try:
                ## check if a new point has come in
                new_length = len(self.data)
                if new_length == data_length:
                    time.sleep(0.01)
                    continue
                data_length = new_length

                if self.y is not None:
                    self.progress_plot.update()

                if not self.active:
                    break
            except KeyboardInterrupt:
                self.client.stop()
                break

    def save(self, filename):
        self.data.to_csv(filename)

    def cancel(self):
        self.client.stop()

    def find_max(self, x, y):
        ''' Returns a value of variable x coinciding with the maximum of variable y '''
        idx = self.data[y].idxmax()
        return self.data.loc[idx, x]

    def find_min(self, x, y):
        ''' Returns a value of variable x coinciding with the minimum of variable y '''
        idx = self.data[y].idxmin()
        return self.data.loc[idx, x]