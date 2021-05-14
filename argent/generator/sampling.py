@kernel
def sample(device, data, samples, wait):
    for i in range(samples):
        try:
            device.sample_mu(data[i])
            delay(wait)
        except RTIOUnderflow:
            continue