from argent.generator import Generator

def test_code_generator():
    initial_state = {'duration': 100e-3, 'TTL': ['A1'], 'DAC': {'A0': 5}, 'DDS': {'A0': {'frequency':1e6}}}
    sequence = [{'duration': 10e-3, 'TTL': ['A0'], 'DAC': {'A0': 1}, 'DDS': {'A0': {'attenuation':0}}},
                {'duration': 10e-3, 'TTL': ['A2'], 'DAC': {'A0': 2}, 'DDS': {'A0': {'attenuation':31}}}
    ]
    Generator(sequence)
