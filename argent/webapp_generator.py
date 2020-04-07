import numpy as np
import re
import textwrap
from argent import Configurator

def generate_custom_scripts(sequence):
    imports = ''

    run = '## custom scripts\n'
    run += 'with sequential:\n'
    run_prefix = run
    no_events = True
    for i, event in enumerate(sequence['script']):
        if event['function'] == '':
            run += '\tdelay({})\n'.format(float(sequence["duration"][i]))
            continue
        no_events = False
        run += '\twith parallel:\n'
        run += '\t\t{}.{}(self)\n'.format(event["module"], event["function"])
        run += '\t\tdelay({})\n'.format(float(sequence["duration"][i]))

        imports += 'import {}\n'.format(event["module"])
    if no_events:
        run = ''
    return imports, run

def generate_dac_events(sequence):
    ## write build function
    devs = []
    nums = []
    for ch in sequence['dac']:
        devs = np.append(devs, re.split('(\d+)', ch)[0])
        nums = np.append(nums, int(re.split('(\d+)', ch)[1]))

    devs = np.unique(devs)

    build = ''
    for dev in devs:
        build += 'self.setattr_device("zotino{}")\n'.format(dev)

    init = ''
    for dev in devs:
        init += 'self.zotino{}.init()\n'.format(dev)


    ## order and group events
    events = {}
    for ch in sequence['dac']:
        time = 0

        for i, event in enumerate(sequence['dac'][ch]):
            offset = float(event.get('offset', 0))

            duration = float(sequence['duration'][i])

            if event['reserved']:
                time += duration
                time = np.round(time, 9)
                continue


            if event.get('mode', None) == 'constant':
                try:
                    setpoint = float(event['setpoint'])
                    t = time + offset
                    if t not in events:
                        events[t] = {}
                    events[t][ch] = setpoint
                except ValueError:
                    pass

            elif event.get('mode', None) == 'ramp':
                try:
                    start = float(event['start'])
                    stop = float(event['stop'])
                    steps = int(event['steps'])

                    dt = duration / steps
                    for j in range(steps):
                        value = start + j/steps * (stop - start)
                        t = time + offset + j*dt
                        if t not in events:
                            events[t] = {}
                        events[t][ch] = float(value)
                except ValueError:
                    pass

            time += duration
            time = np.round(time, 9)


    ## offset so that sequence starts at t=0

    times = np.array(list(events.keys()))
    if len(times) == 0:
        return '', '', ''
    # times -= times[0]   # need this for compatibility with offsets, but doesn't work with other RTIO types yet

    channels = np.array([list(event.keys()) for event in events.values()])
    values = np.array([list(event.values()) for event in events.values()])

    inds = np.argsort(times)

    times = times[inds]
    channels = channels[inds]
    values = values[inds]

    delays = np.diff(times)

    delays = np.append(delays, time - np.sum(delays) - times[0])

    ## write code
    code = '## DAC\n'
    code += 'with sequential:\n'
    if times[0] != 0:
        code += '\tdelay({})\n'.format(times[0])
    for i, event in enumerate(events):
        devs = np.array([])
        nums = np.array([], dtype=int)

        for ch in channels[i]:
            devs = np.append(devs, re.split('(\d+)', ch)[0])
            nums = np.append(nums, int(re.split('(\d+)', ch)[1]))

        code += '\twith parallel:\n'

        for dev in np.unique(devs):
            ids = list(np.array(nums)[np.where(devs == dev)])
            vals = list(np.array(values[i])[np.where(devs == dev)])

            code += '\t\tself.zotino{}.set_dac({}, {})\n'.format(dev, vals, ids)
        if i < len(times):
            code += '\t\tdelay({})\n'.format(np.round(delays[i], 9))

    return build, init, code

def generate_ttl_events(sequence):
    run = '## TTL\n'
    no_events = True
    for ch in sequence['ttl']:
        no_channel_events= True
        run_ch = 'with sequential:\n'
        for i, event in enumerate(sequence['ttl'][ch]):
            duration = float(sequence['duration'][i])
            if event['state']:
                no_events = False
                no_channel_events = False
                run_ch += '\tself.ttl{}.pulse({})\n'.format(ch, duration)
            else:
                run_ch += '\tdelay({})\n'.format(duration)
        if not no_channel_events:
            run += run_ch
    if no_events:
        run = ''
    return run

def generate_adc_events(sequence):
    build = ''
    init = ''
    # for ch in sequence['adc']:
    #     build += 'self.setattr_device("sampler{}")\n'.format(ch)
    #     init += 'self.sampler{}.init()\n'.format(ch)
    for ch in sequence['adc']:
        for event in sequence['adc'][ch]:
            if event['reserved'] or not event['on']:
                continue
            build += 'self.{} = {}\n'.format(event['variable'], [[0 for ch in range(8)] for n in range(int(event["samples"]))])

    run = '## ADC\n'
    run += 'with sequential:\n'
    no_events = True
    run_prefix = run
    for ch in sequence['adc']:
        for i, event in enumerate(sequence['adc'][ch]):
            duration = float(sequence['duration'][i])
            if event['reserved'] or not event['on']:
                run += '\tdelay({})\n'.format(duration)
                continue
            try:
                no_events = False
                samples = int(event['samples'])
                for n in range(samples):
                    run += '\twith parallel:\n'
                    run += '\t\tself.sampler{}.sample_mu(self.{}[{}])\n'.format(ch, event["variable"], n)
                    dt = np.round(duration / samples, 9)
                    run += '\t\tdelay({})\n'.format(dt)
            except ValueError:
                run += '\tdelay({})\n'.format(duration)
    if no_events:
        run = ''

    return build, init, run

def generate_experiment(sequence):
    adc_build, adc_init, adc_run = generate_adc_events(sequence)
    dac_build, dac_init, dac_run = generate_dac_events(sequence)
    ttl_run = generate_ttl_events(sequence)
    script_imports, script_run = generate_custom_scripts(sequence)


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

    for name, var in sequence['variables'].items():
        if var['type'] == 'float':
            value = float(var['value'])
            build += '\tself.{} = {}\n'.format(name, value)

        elif var['type'] == 'int':
            value = int(var['value'])
            build += '\tself.{} = {}\n'.format(name, value)
    build += textwrap.indent(adc_build, '\t')
    # build += textwrap.indent(dac_build, '\t')
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

    # init += textwrap.indent(adc_init, '\t')
    # init += textwrap.indent(dac_init, '\t')
    init += '\tself.core.break_realtime()\n'
    init += '\tdelay(10e-3)\n'
    init += '\n'

    ## write run
    run = '@kernel\n'
    run += 'def run(self):\n'
    run += '\tself.init()\n'
    prefix = '\twhile True:\n'
    prefix += '\t\twith parallel:\n'

    run_body = ''
    run_body += textwrap.indent(ttl_run, '\t\t\t')
    run_body += textwrap.indent(dac_run, '\t\t\t')
    run_body += textwrap.indent(script_run, '\t\t\t')
    run_body += textwrap.indent(adc_run, '\t\t\t')
    if run_body != '':
        run += prefix
        run += run_body
    run += '\n'

    ## write experiment
    experiment = 'from artiq.experiment import *\n'
    experiment += script_imports
    experiment += '\n'
    experiment += 'class Experiment(EnvExperiment):\n'
    experiment += textwrap.indent(build, '\t')
    experiment += textwrap.indent(init, '\t')
    experiment += textwrap.indent(run, '\t')

    return experiment
