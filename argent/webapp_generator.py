import numpy as np
import re
import textwrap

def generate_custom_scripts(sequence):
    imports = ''

    run = '## custom scripts\n'
    run += 'with sequential:\n'
    run_prefix = run

    for i, event in enumerate(sequence['script']):
        if event['function'] == '':
            run += f'\tdelay({float(sequence["duration"][i])})\n'
            continue

        run += '\twith parallel:\n'
        run += f'\t\t{event["module"]}.{event["function"]}()\n'
        run += f'\t\tdelay({float(sequence["duration"][i])})\n'

        imports += f'import {event["module"]}\n'

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
        build += f'self.setattr_device("zotino{dev}")\n'

    init = ''
    for dev in devs:
        init += f'self.zotino{dev}.init()\n'


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

    print(times, events)
    ## write code
    code = '## DAC\n'
    code += 'with sequential:\n'
    if times[0] != 0:
        code += f'\tdelay({times[0]})\n'
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

            code += f'\t\tself.zotino{dev}.set_dac({vals}, {ids})\n'
        if i < len(times):
            code += f'\t\tdelay({np.round(delays[i], 9)})\n'

    return build, init, code

def generate_adc_events(sequence):
    build = ''
    init = ''
    for ch in sequence['adc']:
        build += f'self.setattr_device("sampler{ch}")\n'
        init += f'self.sampler{ch}.init()\n'
    for ch in sequence['adc']:
        for event in sequence['adc'][ch]:
            if event['reserved'] or not event['on']:
                continue
            build += f'self.{event["variable"]} = {[[0 for ch in range(8)] for n in range(int(event["samples"]))]}\n'

    run = '## ADC\n'
    run += 'with sequential:\n'
    run_prefix = run
    for ch in sequence['adc']:
        for i, event in enumerate(sequence['adc'][ch]):
            duration = float(sequence['duration'][i])
            if event['reserved'] or not event['on']:
                run += f'\tdelay({duration})\n'
                continue
            try:
                samples = int(event['samples'])
                for n in range(samples):
                    run += '\twith parallel:\n'
                    run += f'\t\tself.sampler{ch}.sample_mu(self.{event["variable"]}[{n}])\n'
                    dt = np.round(duration / samples, 9)
                    run += f'\t\tdelay({dt})\n'
            except ValueError:
                run += f'\tdelay({duration})\n'
    if run == run_prefix:
        run = ''

    return build, init, run

def generate_experiment(sequence):
    adc_build, adc_init, adc_run = generate_adc_events(sequence)
    dac_build, dac_init, dac_run = generate_dac_events(sequence)
    script_imports, script_run = generate_custom_scripts(sequence)


    ## write build
    build = 'def build(self):\n'
    build += textwrap.indent(adc_build, '\t')
    build += textwrap.indent(dac_build, '\t')
    build += '\n'

    ## write init
    init = '@kernel\n'
    init += 'def init(self):\n'
    init += '\tself.core.reset()\n'
    init += '\tself.core.break_realtime()\n'
    init += textwrap.indent(adc_init, '\t')
    init += textwrap.indent(dac_init, '\t')
    init += '\tself.core.break_realtime()\n'
    init += '\n'

    ## write run
    run = '@kernel\n'
    run += 'def run(self):\n'
    run += '\tself.init()\n'
    run += '\twhile True:\n'
    run += '\t\twith parallel:\n'
    run += textwrap.indent(adc_run, '\t\t\t')
    run += textwrap.indent(dac_run, '\t\t\t')
    run += textwrap.indent(script_run, '\t\t\t')
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
