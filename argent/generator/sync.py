import datetime 

''' Convenience functions handling communications between the ARTIQ kernel and the Argent server '''
@rpc(flags={"async"})
def __sync__(self, output_names, output_values, input_names, input_values, addr):
    inputs = dict(zip(input_names, input_values))
    outputs = dict(zip(output_names, output_values))
    print(outputs)
    try:
        results = {"outputs": outputs, "inputs": inputs, "pid": self.__pid__, 'timestamp': datetime.datetime.now().isoformat()}
        requests.post("http://{}/results".format(addr), json=results)
        self.inputs = requests.get("http://{}/inputs".format(addr)).json()
    except:
        pass

def __update__(self, name) -> TFloat:
    return float(self.inputs[name])

