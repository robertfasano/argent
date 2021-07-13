@kernel
def sample(device, data, samples, wait):
    for i in range(samples):
        try:
            device.sample_mu(data[i])
            delay(wait)
        except RTIOUnderflow:
            continue

@kernel(flags={"fast-math"})
def ramp(board, channels, starts, stops, steps, duration):
    dt = duration / steps
    dV = [(stops[i]-starts[i])/steps for i in range(len(channels))]

    V = starts
    for _ in range(steps):
        board.set_dac(V, channels)
        for i in range(len(channels)):
            V[i] += dV[i]
        delay(dt)
