''' A simple example which outputs a series of DAC voltages into an ADC channel.
    Before running, connect channel 0 of the zotinoA board to channel 0 of the
    samplerA board.
    '''

from artiq.experiment import *
from artiq.coredevice.sampler import adc_mu_to_volt

class AnalogDemo(EnvExperiment):
    def build(self):
        self.setattr_device("core")
        self.setattr_device('zotinoA')  #4 Channels of DDS
        self.setattr_device("samplerA")

    @kernel
    def run(self):
        self.core.reset()
        self.core.break_realtime()
        self.zotinoA.init()
        self.samplerA.init()


        data = [[0 for ch in range(8)] for n in range(10)]  # prepare array for 10 samples
        self.core.break_realtime()
        delay(10*ms)

        voltages = [0.0, 0.5, 1.0, 1.5, 2.0, 2.5, 3.0, 3.5, 4.0, 4.5]
        i = 0
        for v in voltages:
            self.zotinoA.set_dac([v], [0])
            delay(5*ms)
            self.sample(self.samplerA, data, i, 1, 0.001)
            i += 1
            delay(5*ms)

        print('Measured voltages:')
        for i in range(10):
            print(adc_mu_to_volt(data[i][0]))

    @kernel
    def sample(self, device, data, start_index, samples, adc_delay):
        for j in range(samples):
            with parallel:
                device.sample_mu(data[start_index+j])
                delay(adc_delay)
