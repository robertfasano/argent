from IPython.display import display, clear_output
import pandas as pd
import matplotlib.pyplot as plt
import warnings
warnings.filterwarnings("ignore")

class LivePlot:
    def __init__(self, dataset, x, y, legend=None, xlim=None):
        self.dataset = dataset
        self.x = x
        self.y = y
        self.legend = legend
        self.xlim = xlim

        self.fig = plt.figure(dpi=200, figsize=(9, 4.5))
        self.ax = plt.gca()
        plt.xlim(xlim)
        
    def update(self):
        clear_output(wait = True)

        x, y = self.x, self.y
        if self.legend[0] is None:
            z = '__stage__'
        else:
            z = self.legend[0]

        data = self.dataset.data
        df = pd.DataFrame()

        for z0 in data[z].unique():
            subdata = data[data[z] == z0]
            df = df.append(pd.concat([subdata.groupby(x).mean()[y].rename(y), subdata.groupby(x).sem()[y].rename(f'{y}_err'), subdata.groupby(x).mean()[z].rename(z)], axis=1)  )  

        df[z] = df[z].astype(str)

        self.ax.clear()
        for z0 in df[z].unique():
            subdata = df[df[z] == z0]
            if self.legend[0] is None:
                label = f'Stage {z0}'
            else:
                label = f'{self.legend[0]}={z0}'
            self.ax.errorbar(subdata.index, subdata[y], subdata[f'{y}_err'], capsize=4, linestyle='None', markersize=4, marker='o', label=label)
        plt.xlabel(x)
        plt.ylabel(y)
        if self.legend[0] is not None or len(df[z].unique()) > 1:
            plt.legend()

        display(self.fig)
        plt.close()
