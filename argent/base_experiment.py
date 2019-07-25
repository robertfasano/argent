from artiq.experiment import *
import numpy as np

from generated.run import run
from generated.build import build
from conversion import convert_to_dataframe
class Sequencer(EnvExperiment):
    build = build
    run = run

    @kernel
    def sample(self, device, data, start_index, samples, adc_delay):
        for j in range(samples):
            with parallel:
                device.sample_mu(data[start_index+j])
                delay(adc_delay)
