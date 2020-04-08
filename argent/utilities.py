from artiq.language.types import TList, TFloat, TInt32
import requests

def get_floats(self, names) -> TList(TFloat):
    vars = requests.get('http://127.0.0.1:8051/variables').json()
    results = []
    for name in names:
        value = float(vars[name]['value'])
        results.append(value)
        setattr(self, name, value)
    return results

def get_ints(self, names) -> TList(TInt32):
    vars = requests.get('http://127.0.0.1:8051/variables').json()
    results = []
    for name in names:
        value = int(vars[name]['value'])
        results.append(value)
        setattr(self, name, value)
    return results
