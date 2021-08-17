@kernel
def sample(device, data, samples, wait):
    for i in range(samples):
        try:
            device.sample_mu(data[i])
            delay(wait)
        except RTIOUnderflow:
            continue

@kernel(flags={"fast-math"})
def ramp(board, channels, starts, stops, steps, duration, now):
    at_mu(now)
    dt = duration / steps
    dV = [(stops[i]-starts[i])/steps for i in range(len(channels))]

    V = starts
    for _ in range(steps):
        delay(dt)
        for i in range(len(channels)):
            V[i] += dV[i]
        board.set_dac(V, channels)

@kernel(flags={"fast-math"})
def ramp_DDS(dds, start, stop, steps, duration, now):
    at_mu(now)
    dt = duration / steps
    df = (stop - start) / steps

    f = start
    for _ in range(steps):
        delay(dt)
        f += df
        dds.set(f*MHz)