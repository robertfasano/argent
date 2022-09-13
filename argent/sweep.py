import numpy as np
from argent.live_plot import LivePlot
from argent.dataset import Dataset
from scipy.interpolate import interp1d
from scipy.optimize import minimize

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
        self.plotter = None
        self.legend = legend
        if self.legend is None:
            self.legend = [None, []]

        self.run()

    def plot(self, x=None, y=None, legend=None):
        super().plot(x or self.x, y or self.y, legend or [None, []])

    def run(self):
        self.set_run_id(self.run_id)
        if self.y is not None and self.plotter is None:
            self.plotter = LivePlot(self, self.x, self.y, xlim=[self.start, self.stop], legend=self.legend)
        sweep_points = list(np.linspace(self.start, self.stop, self.steps))
        self.client.post('/sweep', {'name': self.x, 'values': sweep_points, 'legend_name': self.legend[0], 'legend_values': self.legend[1], 'sweeps': self.sweeps, 'run_id': self.run_id})
        super().run()

    def save(self, filename):
        self.data.to_csv(filename)

    def cancel(self):
        self.client.stop()

    def find_max(self, x=None, y=None, interpolate=False):
        ''' Returns a value of variable x coinciding with the maximum of variable y '''
        x_data = self.data[x or self.x]
        y_data = self.data[y or self.y]
        if interpolate:
            interpolator = interp1d(x_data, -y_data, kind='cubic')
            x0 = self.find_max(x, y, interpolate=False)
            return minimize(interpolator, x0=x0, bounds=[[x_data.min(), x_data.max()]]).x[0]
        else:
            idx = self.data[y or self.y].idxmax()
            return self.data.loc[idx, x or self.x]

    def find_min(self, x=None, y=None, interpolate=False):
        ''' Returns a value of variable x coinciding with the minimum of variable y '''
        x_data = self.data[x or self.x]
        y_data = self.data[y or self.y]
        if interpolate:
            interpolator = interp1d(x_data, y_data, kind='cubic')
            x0 = self.find_max(x, y, interpolate=False)
            return minimize(interpolator, x0=x0, bounds=[[x_data.min(), x_data.max()]]).x[0]
        else:
            idx = self.data[y or self.y].idxmin()
            return self.data.loc[idx, x or self.x]