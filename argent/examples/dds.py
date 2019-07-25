''' A simple example which changes a DDS channel between three different states
    every 10 ms:
    1. rf off
    2. rf on; -1 dB attenuation, 5 MHz
    3. rf on; 0 dB attenuation, 10 MHz
    '''

from artiq.experiment import *

class DDSDemo(EnvExperiment):
    def build(self):
        self.setattr_device("core")
        self.setattr_device("urukulA_cpld")  #4 Channels of DDS
        self.setattr_device("urukulA_ch0")

    @kernel
    def run(self):
        self.core.reset()
        self.core.break_realtime()
        self.urukulA_cpld.init()
        self.urukulA_ch0.init()
        self.core.break_realtime()

        while True:
            ## state 1
            self.urukulA_ch0.sw.off()
            delay(10*ms)

            ## state 2
            with parallel:
                with sequential:
                    self.urukulA_ch0.sw.on()
                    delay(10*ns)
                    self.urukulA_ch0.set(5*MHz)
                    delay(10*ns)
                    self.urukulA_ch0.set_att(10.)
                delay(10*ms)

            ## state 3
            with parallel:
                with sequential:
                    self.urukulA_ch0.set(10*MHz)
                    delay(10*ns)
                    self.urukulA_ch0.set_att(0.)
                delay(10*ms)
