def write_preloop(sequence):
    ''' Write base code '''
    code = ''
    code += 'from artiq.experiment import *\n'
    code += 'from generated.loop import loop\n'
    code += '@kernel\n'
    code += 'def preloop(self):\n'

    code += '\tself.initialize_kernel()\n'
    code += '\tfor ttl in self._ttls:\n'
    code += '\t\tttl.output()\n'
    code += '\t\tttl.off()\n'

    ''' Prepare data array '''
    adc_delay = 1e-3
    N_samples = []
    for i in range(len(sequence)):
        N_samples.append(int(sequence[i]['duration']/adc_delay))
    code += '\tadc_delay={}\n'.format(adc_delay)
    code += '\tN_samples={}\n'.format(N_samples)
    code += '\tdata = [[[0 for ch in range(8)] for n in range(N_samples[i])] for i in range({})]\n'.format(len(sequence))


    code += '\tself.core.break_realtime()\n'
    code += '\twhile True:\n'
    code += '\t\tdata=loop(self, data, adc_delay, N_samples)\n'
    code += '\t\tprint(data)'

    ''' Finish and save to file '''
    with open('generated/preloop.py', 'w') as file:
        file.write(code)

def write_loop(sequence):
    ''' Write base code '''
    code = ''
    code += 'from artiq.experiment import *\n'
    code += '@kernel\n'
    code += 'def loop(self, data, adc_delay, N_samples):\n'

    ''' Write TTL events '''
    for i in range(len(sequence)):
        step = sequence[i]['TTL']
        last_step = sequence[i-1]['TTL']
        to_turn_on = [x for x in step if x not in last_step]
        to_turn_off = [x for x in last_step if x not in step]
        if i == 0:
            to_turn_on = [x for x in step]
        code += '\twith parallel:\n'
        for ch in to_turn_on:
            code += '\t\tself.ttl{}.on()\n'.format(ch)
        for ch in to_turn_off:
            code += '\t\tself.ttl{}.off()\n'.format(ch)
        code += '\t\tdelay({0:.9f}*s)\n'.format(sequence[i]['duration'])

        ''' Write DDS events '''
        step = sequence[i]['DDS']
        last_step = sequence[i-1]['DDS']

        for d in range(len(step)):
            written_sequential_block = False
            ''' Frequency updates '''
            if i == 0 or step[d]['frequency'] != last_step[d]['frequency']:
                if not written_sequential_block:
                    code += '\t\twith sequential:\n'
                    written_sequential_block = True
                code += '\t\t\tself.urukul0_ch{}.set({}*Hz)\n'.format(d, step[d]["frequency"])
                code += '\t\t\tdelay(10*ns)\n'

            ''' Attenuation updates'''
            if i == 0 or step[d]['attenuation'] != last_step[d]['attenuation']:
                if not written_sequential_block:
                    code += '\t\twith sequential:\n'
                    written_sequential_block = True
                code += '\t\t\tself.urukul0_ch{}.set_att({})\n'.format(d, step[d]["attenuation"])
                code += '\t\t\tdelay(10*ns)\n'

        ''' Write ADC events '''
        if sequence[i]['ADC'] != []:
            code += '\t\tfor j in range(len(N_samples)):\n'
            code += '\t\t\twith parallel:\n'
            code += '\t\t\t\tself.sampler0.sample_mu(data[{}][j])\n'.format(i)
            code += '\t\t\t\tdelay(adc_delay)\n'

    ''' Finish and save to file '''
    code += '\treturn data'

    with open('generated/loop.py', 'w') as file:
        file.write(code)

    return code
