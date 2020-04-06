from artiq.experiment import kernel
from artiq.coredevice.sampler import adc_mu_to_volt

def simple(self):
    data = 0

    with parallel:
        self.ttlA0.off()
        self.ttlB1.on()

        for i in range(10):
            self.zotinoA.set_dac([i], [0])

        self.samplerA.sample_mu(data)

        self.urukulA_ch0.set(5000000)

@kernel
def pid(self):
    input = adc_mu_to_volt(self.voltage[0][0]) # corresponds to variable measured in step 1
    self.output += self.Kp*(self.setpoint - input)
    print('input:', input, 'output:', self.output)

    delay(10e-3)  # delay RTIO cursor to allow for computation time

    self.zotinoA.set_dac([self.output], [0])
