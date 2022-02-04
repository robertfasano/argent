import numpy as np
from argent.live_plot import LivePlot
import requests
import json

class Sweep:
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
        self.x = x
        self.start = start
        self.stop = stop
        self.steps = steps
        self.client = client
        self.sweeps = sweeps
        self.y = plot
        self.dataset = self.client.dataset()

        self.legend = legend
        if self.legend is None:
            self.legend = [None, []]

        if plot is not None:
            self.progress_plot = LivePlot(self.dataset, x, plot, xlim=[start, stop], legend=legend)
        self.run()

    def run(self):
        sweep_points = list(np.linspace(self.start, self.stop, self.steps))
        self.client.post('/sweep', {'name': self.x, 'values': sweep_points, 'legend_name': self.legend[0], 'legend_values': self.legend[1], 'sweeps': self.sweeps})
        data_length = len(self.dataset.data)
        first_cycle = True
        while True:
            ## check if a new point has come in
            new_length = len(self.dataset.data)
            if new_length == data_length:
                continue
            data_length = new_length

            # don't plot points from before sweep
            if first_cycle:
                y_value = self.dataset.data.iloc[-1][self.x]
                if y_value != sweep_points[0]:
                    continue
                else:
                    first_cycle = False
                    self.dataset.start_time = self.dataset.data.index[-2]

            self.progress_plot.update()

            if not self.sweeping():
                break

    def save(self, filename):
        self.dataset.data.to_csv(filename)

    def sweeping(self):
        return json.loads(requests.get(f"http://{self.client.address}/sweep").text)
