from IPython.display import display, clear_output
import matplotlib.pyplot as plt
import pandas as pd

class LivePlot:
    def __init__(self, dataset, x, y, legend=None, xlim=None):
        self.dataset = dataset
        self.x = x
        self.y = y
        self.legend = legend
        
        self.fig = plt.figure(dpi=400, figsize=(9, 4.5))
        self.ax = plt.gca()
        self.xlim = xlim


    def update(self):
        x = self.dataset.data[self.x]
        y = self.dataset.data[self.y]
        
        if self.legend is None:
            z = self.dataset.data['__stage__']
        else:
            z = self.dataset.data[self.legend[0]]
        z_vals = z.unique()
            
        concat = pd.concat([x, y, z], axis=1).dropna()
        concat.columns = ['x', 'y', 'z']
        self.ax.clear()
        for z0 in z_vals:
            subdata = concat[concat.z == z0]
            mean = subdata.groupby(subdata.x).mean()
            sterror = subdata.groupby(subdata.x).sem()
            sterror.y = sterror.y.fillna(0)
            if self.legend is None:
                label = f'Stage {z0}'
            else:
                label = f'{self.legend[0]}={z0}'
            self.ax.errorbar(mean.index, mean.y, sterror.y, capsize=4, linestyle='None', markersize=4, marker='o', label=label)

                
        plt.ylabel(self.y)
        plt.xlabel(self.x)

        if len(z_vals) > 1 or self.legend is not None:
            plt.legend()
        
        if self.xlim is not None:
            self.ax.set_xlim(self.xlim)
        display(self.fig)
        clear_output(wait = True)
