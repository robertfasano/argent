def write_code(sequence):
    ''' Write base code '''
    code = ''
    code += 'from artiq.experiment import *\n'
    code += '@kernel\n'
    code += 'def execute(self, data):\n'

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

    ''' Finish and save to file '''
    code += '\treturn data'

    with open('generated_code.py', 'w') as file:
        file.write(code)

    return code
