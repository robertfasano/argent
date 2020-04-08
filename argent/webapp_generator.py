import numpy as np
import re
import textwrap
from argent import Configurator
import collections

def merge_dicts(dct, merge_dct):
    """ Recursive dict merge. Inspired by :meth:``dict.update()``, instead of
    updating only top-level keys, dict_merge recurses down into dicts nested
    to an arbitrary depth, updating keys. The ``merge_dct`` is merged into
    ``dct``.
    :param dct: dict onto which the merge is executed
    :param merge_dct: dct merged into dct
    :return: None
    Copyright (C) 2016 Paul Durivage <pauldurivage+github@gmail.com>
    """
    for k, v in merge_dct.items():
        if (k in dct and isinstance(dct[k], dict)
                and isinstance(merge_dct[k], collections.Mapping)):
            merge_dicts(dct[k], merge_dct[k])
        else:
            dct[k] = merge_dct[k]

def unnormalize(sequence):
    ''' Convert from a normalized (flattened) sequence definition to a grouping by timestep '''
    timesteps = {}
    t = 0.0
    for i in range(len(sequence['duration'])):
        step = {}
        step['duration'] = float(sequence['duration'][i])

        for dev_type in ['adc', 'dac', 'dds', 'ttl']:
            step[dev_type] = {}
            for ch in sequence[dev_type]:
                step[dev_type][ch] = sequence[dev_type][ch][i]

        if sequence['script'][i]['function'] != '':
            step['script'] = sequence['script'][i]

        timesteps[t] = step
        t += step['duration']

        step['original'] = True
    return timesteps

def remove_reserved(sequence):
    ''' Filter out reserved steps and remove the "reserved" field '''
    for t, step in sequence.items():
        for dev_type in ['adc', 'dac', 'dds', 'ttl']:
            channels = list(step[dev_type].keys())
            for ch in channels:
                if step[dev_type][ch]['reserved']:
                    del step[dev_type][ch]
                else:
                    del step[dev_type][ch]['reserved']
            if step[dev_type] == {}:
                del step[dev_type]
        sequence[t] = step
    return sequence


def simplify_adc_events(sequence):
    times = list(sequence.keys())
    steps = list(sequence.values())

    for i, step in enumerate(steps):
        t = times[i]
        if 'adc' not in step:
            continue

        channels = list(step['adc'].keys())

        new_sequence = {}
        for ch in channels:
            print('ADC', ch, step['adc'][ch])
            variable = step['adc'][ch]['variable']
            if variable == '' or not step['adc'][ch]['on']:
                del sequence[t]['adc'][ch]
                continue
            try:
                samples = int(step['adc'][ch]['samples'])
            except ValueError:
                del sequence[t]['adc'][ch]
                continue
            for j in range(samples):
                t_step = t + j*step['duration']/samples
                t_step = np.round(t_step, 9)

                merge_dicts(sequence, {t_step: {'adc': {ch: {'variable': variable, 'index': j}}}})
        if sequence[t]['adc'] == {}:
            del sequence[t]['adc']
    return sequence

def simplify_dac_events(sequence):
    times = list(sequence.keys())
    steps = list(sequence.values())

    for i, step in enumerate(steps):
        t = times[i]

        if 'dac' not in step:
            continue

        channels = list(step['dac'].keys())
        for ch in channels:
            ch_step = step['dac'][ch]

            if ch_step['mode'] == 'ramp':
                try:
                    steps = int(ch_step['steps'])
                    start = float(ch_step['start'])
                    stop = float(ch_step['stop'])
                except ValueError:
                    del sequence[t]['dac'][ch]
                    continue
                step['dac'][ch] = start

                for j in range(steps):
                    value = start + j/steps * (stop - start)
                    t_step = t + j*step['duration']/steps
                    t_step = np.round(t_step, 9)
                    merge_dicts(sequence, {t_step: {'dac': {ch: value}}})

            else:
                try:
                    setpoint = float(step['dac'][ch]['setpoint'])
                except ValueError:
                    del sequence[t]['dac'][ch]
                    continue
                step['dac'][ch] = setpoint
            sequence[t] = step

        if sequence[t]['dac'] == {}:
            del sequence[t]['dac']

    return sequence

def simplify_dds_events(sequence):
    times = list(sequence.keys())
    steps = list(sequence.values())

    for i, step in enumerate(steps):
        t = times[i]

        if 'dds' not in step:
            continue

        channels = list(step['dds'].keys())
        for ch in channels:
            ## simplify frequency updates
            frequency_step = step['dds'][ch]['frequency']

            if frequency_step['mode'] == 'ramp':
                try:
                    steps = int(frequency_step['steps'])
                    start = float(frequency_step['start'])
                    stop = float(frequency_step['stop'])
                except ValueError:
                    del sequence[t]['dds'][ch]['frequency']
                    continue
                step['dds'][ch]['frequency'] = start

                for j in range(steps):
                    value = start + j/steps * (stop - start)
                    t_step = t + j*step['duration']/steps
                    t_step = np.round(t_step, 9)
                    merge_dicts(sequence, {t_step: {'dds': {ch: {'frequency': value}}}})

            else:
                try:
                    setpoint = float(frequency_step['setpoint'])
                except ValueError:
                    del sequence[t]['dds'][ch]['frequency']
                    continue
                step['dds'][ch]['frequency'] = setpoint
            sequence[t] = step

        for ch in channels:
            ## simplify attenuation updates
            attenuation_step = step['dds'][ch]['attenuation']
            if attenuation_step['mode'] == 'ramp':
                try:
                    steps = int(attenuation_step['steps'])
                    start = float(attenuation_step['start'])
                    stop = float(attenuation_step['stop'])
                except ValueError:
                    del sequence[t]['dds'][ch]['attenuation']
                    continue
                step['dds'][ch]['attenuation'] = start

                for j in range(steps):
                    value = start + j/steps * (stop - start)
                    t_step = t + j*step['duration']/steps
                    t_step = np.round(t_step, 9)
                    merge_dicts(sequence, {t_step: {'dds': {ch: {'attenuation': value}}}})

            else:
                try:
                    setpoint = float(attenuation_step['setpoint'])
                except ValueError:
                    del sequence[t]['dds'][ch]['attenuation']
                    continue

                step['dds'][ch]['attenuation'] = float(attenuation_step['setpoint'])
            sequence[t] = step

    return sequence

def simplify_ttl_events(sequence):
    ''' Replace TTL state dicts with a list of TTLs which are on during each step'''
    times = list(sequence.keys())
    steps = list(sequence.values())
    for i, step in enumerate(steps):
        t = times[i]
        on = []
        if 'ttl' not in step:
            continue
        channels = list(step['ttl'].keys())
        for ch in channels:
            if step['ttl'][ch]['state'] == True:
                on.append(ch)
        sequence[t]['ttl'] = on
    return sequence

def prepare(sequence):
    total_duration = np.sum(np.array(sequence['duration']).astype(float))
    print(sequence)
    sequence = unnormalize(sequence)
    sequence = remove_reserved(sequence)
    # sequence
    sequence = simplify_dac_events(sequence)
    sequence = simplify_dds_events(sequence)
    sequence = simplify_ttl_events(sequence)
    sequence = simplify_adc_events(sequence)
    sequence = dict(sorted(sequence.items()))
    sequence[total_duration] = {}     # event marking the end

    print(sequence)
    return sequence

def generate(sequence):
    timesteps = []

    for i, step in enumerate(sequence.values()):
        if i == len(sequence)-1:
            break
        code = ''
        times = list(sequence.keys())
        duration = np.round(times[i+1] - times[i], 9)
        code += 'delay({})\n'.format(duration)

        if 'script' in step:
            code += '{}.{}(self)\n'.format(step['script']['module'], step['script']['function'])

        if 'dac' in step:
             ## group by device
            devs = np.array([])
            nums = np.array([], dtype=int)
            for ch in step['dac']:
                devs = np.append(devs, re.split('(\d+)', ch)[0])
            devs = np.unique(devs)


            for dev in devs:
                output_channels = []
                output_values = []

                for ch in step['dac']:
                    ch_dev = re.split('(\d+)', ch)[0]
                    ch_num = int(re.split('(\d+)', ch)[1])

                    if ch_dev == dev:
                        output_channels.append(ch_num)
                        output_values.append(step['dac'][ch])
                code += 'self.zotino{}.set_dac({}, {})\n'.format(dev, output_values, output_channels)

        if 'dds' in step:
            dds_code = ''
            for ch in step['dds']:
                ch_dev = re.split('(\d+)', ch)[0]
                ch_num = int(re.split('(\d+)', ch)[1])
                if 'frequency' in step['dds'][ch]:
                    val = step['dds'][ch]['frequency']
                    dds_code += '\tself.urukul{}_ch{}.set({})\n'.format(ch_dev, ch_num, val)
                    dds_code += '\tdelay(10*ns)\n'
                if 'attenuation' in step['dds'][ch]:
                    val = step['dds'][ch]['attenuation']
                    dds_code += '\tself.urukul{}_ch{}.set_att({})\n'.format(ch_dev, ch_num, val)
                    dds_code += '\tdelay(10*ns)\n'
            if dds_code != '':
                code += 'with sequential:\n'
                code += dds_code

        if 'ttl' in step:
            for ch in step['ttl']:
                code += 'self.ttl{}.pulse({})\n'.format(ch, duration)

        if 'adc' in step:
            for ch in step['adc']:
                var = step['adc'][ch]['variable']
                index = step['adc'][ch]['index']
                code += 'self.sampler{}.sample_mu(self.{}[{}])\n'.format(ch, var, index)

        timesteps.append(code)

    all_code = ''
    n_original = 0
    for i, code in enumerate(timesteps):
        if code != '':
            t = list(sequence.keys())[i]
            if sequence[t].get('original', False):
                all_code += '\n## Sequence timestep {}\n'.format(n_original)
                n_original += 1
            all_code += 'with parallel:\n'
            all_code += textwrap.indent(code, '\t')

    all_code += '\nself.__sync__()\n'
    return all_code

def generate_script_imports(sequence):
    imports = ''

    for i, event in enumerate(sequence['script']):
        if event['function'] == '':
            continue

        imports += 'import {}\n'.format(event["module"])

    return imports

def build_adc_variables(sequence):
    build = ''

    for ch in sequence['adc']:
        for event in sequence['adc'][ch]:
            if event['reserved'] or not event['on']:
                continue
            build += 'self.{} = {}\n'.format(event['variable'], [[0 for ch in range(8)] for n in range(int(event["samples"]))])

    return build

def generate_experiment(sequence):
    adc_build = build_adc_variables(sequence)
    script_imports = generate_script_imports(sequence)


    ## write build
    devs = Configurator.load('devices')[0]
    build = 'def build(self):\n'
    build += '\tself.setattr_device("core")\n'
    for adc in devs['adc']:
        build += '\tself.setattr_device("{}")\n'.format(adc)
    for dac in devs['dac']:
        build += '\tself.setattr_device("{}")\n'.format(dac)
    for ttl in devs['ttl']:
        for i in range(8):
            build += '\tself.setattr_device("{}{}")\n'.format(ttl, i)
    build += '\tself.paused = False\n'
    for name, var in sequence['variables'].items():
        if var['kind'] == 'Data':
            continue
        if var['datatype'] == 'float':
            value = float(var['value'])
            build += '\tself.{} = {}\n'.format(name, value)

        elif var['datatype'] == 'int':
            value = int(var['value'])
            build += '\tself.{} = {}\n'.format(name, value)
    build += textwrap.indent(adc_build, '\t')

    build += '\tself.socket = zmq.Context().socket(zmq.PUB)\n'
    build += '\tself.socket.bind("tcp://127.0.0.1:8052")\n'
    build += '\n'

    ## write init
    init = '@kernel\n'
    init += 'def init(self):\n'
    init += '\tself.core.reset()\n'
    init += '\tself.core.break_realtime()\n'
    for adc in devs['adc']:
        init += '\tself.{}.init()\n'.format(adc)
    for dac in devs['dac']:
        init += '\tself.{}.init()\n'.format(dac)


    init += '\tself.core.break_realtime()\n'
    init += '\tdelay(10e-3)\n'
    init += '\n'

    ## write run
    run = '@kernel\n'
    run += 'def run(self):\n'
    run += '\tself.init()\n\n'
    run += '\tfirst=True\n'
    run += '\twhile True:\n'
    run += '\t\tif self.paused:\n'
    run += '\t\t\tself.core.break_realtime()\n'
    run += '\t\t\tself.__sync__(broadcast=False)\n'
    run += '\t\t\tfirst=True\n'

    run += '\t\telse:\n'
    run += '\t\t\tif first:\n'
    run += '\t\t\t\tself.core.break_realtime()\n'
    run += '\t\t\t\tfirst=False\n'
    run += textwrap.indent(generate(prepare(sequence)), '\t\t\t')
    run += '\n'


    ## write experiment
    experiment = 'from artiq.experiment import *\n'
    experiment += 'import zmq\n'
    experiment += 'from argent.utilities import get_ints, get_floats, get_bools, get_controls\n'
    experiment += script_imports
    experiment += '\n'
    experiment += 'class Experiment(EnvExperiment):\n'
    experiment += textwrap.indent(build, '\t')
    experiment += textwrap.indent(init, '\t')
    experiment += textwrap.indent(run, '\t')

    sync = generate_sync(sequence)
    experiment += textwrap.indent(sync, '\t')
    return experiment

def generate_sync(sequence):
    input_floats = {}
    input_ints = {}
    input_bools = {}
    outputs = {}

    for name, var in sequence['variables'].items():
        if var['kind'] == 'Input':
            if var['datatype'] == 'float':
                input_floats[name] = var
            elif var['datatype'] == 'int':
                input_ints[name] = var
            elif var['datatype'] == 'bool':
                input_bools[name] = var
        elif var['kind'] == 'Output':
            outputs[name] = var

    self_dot_outputs = ['self.'+name for name in outputs.keys()]
    self_dot_input_floats = ['self.'+name for name in input_floats.keys()]
    self_dot_input_ints = ['self.'+name for name in input_ints.keys()]
    self_dot_input_bools = ['self.'+name for name in input_ints.keys()]
    code = '@kernel\n'
    code += 'def __sync__(self, broadcast=True):\n'
    # code += '\tentry_slack = now_mu() - self.core.get_rtio_counter_mu()\n'
    code += '\t[self.paused] = get_controls(self, ["paused"])\n'
    if len(outputs) > 0:
        code += '\tif broadcast:\n'
        code += '\t\t\tself.__broadcast__({})\n'.format(', '.join(self_dot_outputs))
    if len(input_floats) > 0:
        code += '\t[{}] = get_floats(self, [{}])\n'.format(', '.join(self_dot_input_floats), ', '.join('"{}"'.format(i) for i in input_floats.keys()))
    if len(input_ints) > 0:
        code += '\t[{}] = get_ints(self, [{}])\n'.format(', '.join(self_dot_input_ints), ', '.join('"{}"'.format(i) for i in input_ints.keys()))
    if len(input_bools) > 0:
        code += '\t[{}] = get_ints(self, [{}])\n'.format(', '.join(self_dot_input_bools), ', '.join('"{}"'.format(i) for i in input_bools.keys()))

    # code += '\texit_slack = now_mu() - self.core.get_rtio_counter_mu()\n'
    # code += '\tprint("Synced to server. Slack cost: ", (exit_slack-entry_slack), " Remaining slack:", exit_slack)\n'
    code += '\n'

    if len(outputs) > 0:
        code +='@rpc(flags={"async"})\n'
        code += 'def __broadcast__(self, {}):\n'.format(', '.join(outputs.keys()))
        code += '\tmsg = {}\n'

        for name, var in outputs.items():
            code += '\tmsg["{}"] = {}\n'.format(name, name)
        code += '\tself.socket.send_json(msg)\n'

    return code
