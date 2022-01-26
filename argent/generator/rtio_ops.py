import numpy as np

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

## new ramp functions
@kernel(flags={"fast-math"})
def write_dac_ramp(board, channels, points, duration, now):
    at_mu(now)
    dt = duration / (len(points)+1)

    for p in points:
        delay(dt)
        board.set_dac(points[i], channels)

@kernel(flags={"fast-math"})
def linear_ramp(starts, stops, steps):
    ''' Returns a multidimensional array of points for a linear ramp, each row representing a step and each
        column representing a channel. The first point in the ramp is skipped, assumed to be written manually
        by the code generator before the ramp starts.
    '''
    dV = [(stops[i]-starts[i])/(steps-1) for i in range(len(starts))]
    V = [[0.0]*len(starts) for i in range(steps-1)]
    for i in range(steps-1):
        for ch in range(len(starts)):
            V[i][ch] = starts[ch] + (i+1)*dV[ch]
    return V

def spline_ramp(points, steps):
    ''' Returns a multidimensional array of points for a spline ramp, each row representing a step and each
        column representing a channel. The first point in the ramp is skipped, assumed to be written manually
        by the code generator before the ramp starts.
        Arguments:
            points: a 2D array containing a list of points for each channel
    '''
    ramps = []
    for y in points:
        x = np.linspace(0, 1, len(y))
        x_ramp = np.linspace(1/(steps-1), 1, steps-1)
        y_ramp = np.polyval(np.polyfit(x, y, len(x)-1), x_ramp)

        ramps.append(y_ramp)
    return np.transpose(ramps).tolist()