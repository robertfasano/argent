import pandas as pd
import numpy as np
from artiq.coredevice.sampler import adc_mu_to_volt

def convert_to_dataframe(data, durations, adc_delay):
    df = pd.DataFrame(columns=range(8))
    total_time = 0
    for i in range(len(durations)):
        t0 = total_time
        index = np.linspace(0, (len(data[i])-1)*adc_delay, len(data[i])) + total_time
        subdf = pd.DataFrame(np.array(data[i]), index=index)
        df = df.append(subdf)
        total_time += durations[i]
    df = df[(df.T != 0).any()]
    # df = df[self.adc_channels]
    df = adc_mu_to_volt(df)
    print(df)
