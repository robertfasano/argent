import datetime 

''' Convenience functions handling communications between the ARTIQ kernel and the Argent server '''
@rpc(flags={"async"})
def __push__(self, stage, stage_name, cycle, parameter_names, parameter_values, variable_names, variable_values, addr):
    variables = dict(zip(variable_names, variable_values))
    parameters = dict(zip(parameter_names, parameter_values))
    timestamp = datetime.datetime.now().isoformat()
    print('\n' + timestamp + ' - Cycle {}, stage {}'.format(cycle, stage))
    for key, val in parameters.items():
        print(key, ':', val)
    try:
        results = {"parameters": parameters, "variables": variables, "pid": self.__pid__, "stage": int(stage), 'cycle': int(cycle), 'timestamp': timestamp, 'sequence': stage_name}
        requests.post("http://{}/results".format(addr), json=results)
    except Exception as e:
        print(e)


@rpc(flags={"async"})
def __pull__(self, addr):
    try:
        self.variables = requests.get("http://{}/variables".format(addr)).json()
    except Exception as e:
        print(e)

def __update__(self, name) -> TFloat:
    return float(self.variables[name])

