''' A simple example which switches TTL channel 0 on and off every 10 ms '''
from artiq.experiment import *

class TTLDemo(EnvExperiment):
    def build(self):
        self.setattr_device("core")
        self.setattr_device("core_dma")
        self.setattr_device("ttlA0")

    @kernel
    def run(self):
        self.core.reset()
        self.core.break_realtime()

        while True:
            self.ttlA0.on()
            delay(10*ms)
            self.ttlA0.off()
            delay(10*ms)
