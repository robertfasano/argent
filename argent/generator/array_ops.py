@kernel
def convert(val):
    return adc_mu_to_volt(val)

@kernel
def array_sum(array, ch):
    ''' Compute the sum along one channel '''
    slice = [arr[ch] for arr in array]
    result = 0
    for val in slice:
        result += val
    return result

@kernel
def array_mean(array, ch):
    ''' Compute the mean along one channel '''
    return convert(array_sum(array, ch)) / len(array)

@kernel
def array_max(array, ch):
    ''' Compute the max along one channel '''
    slice = [arr[ch] for arr in array]
    result = 0
    for val in slice:
        if val > result:
            result = val
    return convert(result)

@kernel
def array_min(array, ch):
    ''' Compute the min along one channel '''
    slice = [arr[ch] for arr in array]
    result = 2**16+1
    for val in slice:
        if val < result:
            result = val
    return convert(result)

@kernel
def array_first(array, ch):
    ''' Returns the first element from one channel '''
    return convert(array[0][ch])

@kernel
def array_last(array, ch):
    ''' Returns the last element from one channel '''
    return convert(array[-1][ch])
