import pandas as pd
import numpy as np
from artiq.coredevice.sampler import adc_mu_to_volt

def convert_to_dataframe(data, durations, adc_delays):
    elapsed_time = 0
    index = []
    for i, delay in enumerate(adc_delays):
        samples = int(durations[i]/delay)
        index.extend(np.linspace(0, (samples-1)*delay, samples) + elapsed_time)
        elapsed_time += durations[i]
    df = pd.DataFrame(np.array(data), index = index)
    df = adc_mu_to_volt(df)

    print(df)
