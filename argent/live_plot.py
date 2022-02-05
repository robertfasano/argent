from IPython.display import display, clear_output
import pandas as pd
import plotly.express as px
import matplotlib.pyplot as plt
import warnings
warnings.filterwarnings("ignore")

class LivePlot:
    def __init__(self, dataset, x, y, legend=None, xlim=None, backend='matplotlib'):
        self.dataset = dataset
        self.x = x
        self.y = y
        self.legend = legend
        self.backend = backend
    
        if backend == 'matplotlib':
            self.fig = plt.figure(dpi=200, figsize=(9, 4.5))
            self.ax = plt.gca()


    def update(self):
        x, y = self.x, self.y
        if self.legend is None:
            z = '__stage__'
        else:
            z = self.legend[0]

        data = self.dataset.data
        df = pd.DataFrame()

        for z0 in data[z].unique():
            subdata = data[data[z] == z0]
            df = df.append(pd.concat([subdata.groupby(x).mean()[y].rename(y), subdata.groupby(x).sem()[y].rename(f'{y}_err'), subdata.groupby(x).mean()[z].rename(z)], axis=1)  )  

        df[z] = df[z].astype(str)

        if self.backend == 'plotly':
            fig = px.scatter(df, y=y, error_y=f'{y}_err', symbol=z, color=z, template='plotly_white', width=1280, height=720)
            fig.update_layout(legend=dict(
                orientation="h",
                yanchor="bottom",
                y=1.02,
                xanchor="right",
                x=1
            ))

        else:
            self.ax.clear()
            for z0 in df[z].unique():
                subdata = df[df[z] == z0]
                if self.legend is None:
                    label = f'Stage {z0}'
                else:
                    label = f'{self.legend[0]}={z0}'
                self.ax.errorbar(subdata.index, subdata[y], subdata[f'{y}_err'], capsize=4, linestyle='None', markersize=4, marker='o', label=label)
            plt.xlabel(x)
            plt.ylabel(y)
            plt.legend()
            fig = self.fig

        display(fig)
        clear_output(wait = True)
