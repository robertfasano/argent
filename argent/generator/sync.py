import datetime 

''' Convenience functions handling communications between the ARTIQ kernel and the Argent server '''
@rpc(flags={"async"})
def __push__(self, stage, stage_name, cycle, variable_names, variable_values, addr):
    variables = dict(zip(variable_names, variable_values))
    timestamp = datetime.datetime.now().isoformat()
    print('\n' + timestamp + ' - Cycle {}, stage {}'.format(cycle, stage))
    try:
        results = {"variables": variables, "pid": self.__pid__, "stage": int(stage), 'cycle': int(cycle), 'timestamp': timestamp, 'sequence': stage_name}
        requests.post("http://{}/results".format(addr), json=results)
    except Exception as e:
        print(e)

@rpc(flags={"async"})
def __heartbeat__(self, stage, stage_name, cycle, addr):
    timestamp = datetime.datetime.now().isoformat()
    print('\n' + timestamp + ' - Cycle {}, stage {}'.format(cycle, stage))
    try:
        results = {"variables": {}, "pid": self.__pid__, "stage": int(stage), 'cycle': int(cycle), 'timestamp': timestamp, 'sequence': stage_name}
        requests.post("http://{}/results".format(addr), json=results)
    except Exception as e:
        print(e)

@rpc
def __pull__(self, addr):
    try:
        variables = requests.get("http://{}/variables?source=ARTIQ".format(addr)).json()
        for name in variables:
            self.variables[name] = float(variables[name].value)
    except Exception as e:
        print(e)

def __update__(self, name) -> TFloat:
    return float(self.variables[name])

