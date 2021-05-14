import datetime 

''' Convenience functions handling communications between the ARTIQ kernel and the Argent server '''
@rpc(flags={"async"})
def __push__(self, stage, cycle, output_names, output_values, input_names, input_values, addr):
    inputs = dict(zip(input_names, input_values))
    outputs = dict(zip(output_names, output_values))
    timestamp = datetime.datetime.now().isoformat()
    print('\n' + timestamp + ' - Cycle {}, stage {}'.format(cycle, stage))
    for key, val in outputs.items():
        print(key, ':', val)
    try:
        results = {"outputs": outputs, "inputs": inputs, "pid": self.__pid__, "stage": int(stage), 'cycle': int(cycle), 'timestamp': timestamp}
        requests.post("http://{}/results".format(addr), json=results)
        # self.inputs = requests.get("http://{}/inputs".format(addr)).json()
    except Exception as e:
        print(e)

@rpc(flags={"async"})
def __pull__(self, addr):
    try:
        self.inputs = requests.get("http://{}/inputs".format(addr)).json()
    except Exception as e:
        print(e)

def __update__(self, name) -> TFloat:
    return float(self.inputs[name])

