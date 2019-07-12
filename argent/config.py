## enter numerical channel numbers for TTL, ADC, DAC, and DDS channels.
channels = {"TTL": list(range(0,8)),
            "ADC": list(range(0,8)),
            "DAC": list(range(0,32)),
            "DDS": list(range(0,4))
}

''' Enter names of i/o devices as they appear in device_db.py, with the device
    name prefixes removed. For example, if you have a device 'ttlA0', add
    'A0' to the 'ttl' field.
'''
devices = {
            'ttl': [f'A{ch}' for ch in range(0,8)],
            'adc': ['sampler0'],
            'dac': ['zotinoA'],
            'dds': ['urukulA']
}

device_db = 'C:/argent/argent/device_db.py'
