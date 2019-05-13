from artiq.experiment import *
import numpy as np

from generated_code import execute

class Sequencer(EnvExperiment):
    def build(self):
        self.setattr_device("core")
        self.setattr_device("scheduler")
        self.setattr_device("core_dma")
        self.setattr_device("urukul0_cpld")  #4 Channels of DDS
        self._dds = []
        for i in range(4):
            self.setattr_device('urukul0_ch{}'.format(i))
            dev = getattr(self, 'urukul0_ch{}'.format(i))
            self._dds.append(dev)
            
        self._ttls = []
        for i in range(16):
            self.setattr_device("ttl%i"%i)
            dev = getattr(self, "ttl%i"%i)
            self._ttls.append(dev)

        self.setattr_device('zotino0')          # 32 channel DAC
        self.setattr_device('sampler0')         # 8 channel ADC

        self.data = [[[0]]]

    @kernel
    def initialize_kernel(self):
        self.core.reset()
        self.core.break_realtime()
        self.sampler0.init()
        self.core.break_realtime()
        self.zotino0.init()
        self.core.break_realtime()
        self.urukul0_cpld.init()
        for i in range(4):
            self._dds[i].init()         # initialize channel
            self._dds[i].sw.on()        # open rf switch
        delay(10*ms)

    @kernel
    def run(self):
        self.initialize_kernel()
        for ttl in self._ttls:
            ttl.output()
        data = [0]

        while True:
            data = execute(self, data)
