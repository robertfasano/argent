
def simple(self):
    data = 0

    with parallel:
        self.ttlA0.off()
        self.ttlB1.on()

        for i in range(10):
            self.zotinoA.set_dac([i], [0])

        self.samplerA.sample_mu(data)

        self.urukulA_ch0.set(5000000)
