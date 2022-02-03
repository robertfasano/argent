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
        board.set_dac(p, channels)

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

@kernel(flags={"fast-math"})
def spline_ramp(board, channels, points, steps, duration, now):
    ''' Returns a multidimensional array of points for a linear ramp, each row representing a step and each
        column representing a channel. The first point in the ramp is skipped, assumed to be written manually
        by the code generator before the ramp starts.
    '''
    ramps = [[0.0]*len(points) for s in range(steps+1)]

    dt = 1/(steps+1)
    for i in range(len(channels)):
        y = points[i]

        if len(y) == 2:   ## linear ramp
            a = y[1] - y[0]
            b = y[0]
            for j in range(steps+1):
                ramps[j][i] = linear((j+1)*dt, a, b)

        elif len(y) == 3:  ## quadratic ramp
            start = y[0]
            midpoint = y[1]
            stop = y[2]

            ## calculate quadratic coefficients
            a = -2*(2*midpoint-start-stop)
            b = 4*midpoint-3*start-stop
            c = start

            for j in range(steps+1):
                ramps[j][i] = quadratic((j+1)*dt, a, b, c)

    at_mu(now)
    dt = duration / (steps+1)

    for p in ramps:
        delay(dt)
        board.set_dac(p, channels)


@kernel(flags={"fast-math"})
def quadratic(x, a, b, c):
    return a*x**2 + b*x + c

@kernel(flags={"fast-math"})
def linear(x, a, b):
    return a*x+b

    