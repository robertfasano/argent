import produce from 'immer'

function swap(array, a, b) {
  // Swaps elements with indices a and b of a passed array in place
  let temp = array[a]
  array[a] = array[b]
  array[b] = temp
}

export default function reducer(state=[], action) {
  switch(action.type) {
    default : return state;

    case 'adc/samples':
      return produce(state, draft => {
        draft['adc'][action.channel][action.timestep]['samples'] = action.value
      })

    case 'adc/toggle':
      let checked = state['adc'][action.channel][action.timestep]['on']
      return produce(state, draft => {
        draft['adc'][action.channel][action.timestep]['on'] = !checked
      })

    case 'dac/mode':
      return produce(state, draft => {
        draft['dac'][action.channel][action.timestep]['mode'] = action.value
      })

    case 'dac/setpoint':
      return produce(state, draft => {
        draft['dac'][action.channel][action.timestep]['setpoint'] = action.value
      })

    case 'dac/start':
      return produce(state, draft => {
        draft['dac'][action.channel][action.timestep]['start'] = action.value
      })

    case 'dac/stop':
      return produce(state, draft => {
        draft['dac'][action.channel][action.timestep]['stop'] = action.value
      })

    case 'dds/attenuation/mode':
      return produce(state, draft => {
        draft['dds'][action.channel][action.timestep]['attenuation']['mode'] = action.value
      })

    case 'dds/attenuation/setpoint':
      return produce(state, draft => {
        draft['dds'][action.channel][action.timestep]['attenuation']['setpoint'] = action.value
      })

    case 'dds/attenuation/start':
      return produce(state, draft => {
        draft['dds'][action.channel][action.timestep]['attenuation']['start'] = action.value
      })

    case 'dds/attenuation/stop':
      return produce(state, draft => {
        draft['dds'][action.channel][action.timestep]['attenuation']['stop'] = action.value
      })

    case 'dds/frequency/mode':
      return produce(state, draft => {
        draft['dds'][action.channel][action.timestep]['frequency']['mode'] = action.value
      })

    case 'dds/frequency/setpoint':
      return produce(state, draft => {
        draft['dds'][action.channel][action.timestep]['frequency']['setpoint'] = action.value
      })

    case 'dds/frequency/start':
      return produce(state, draft => {
        draft['dds'][action.channel][action.timestep]['frequency']['start'] = action.value
      })

    case 'dds/frequency/stop':
      return produce(state, draft => {
        draft['dds'][action.channel][action.timestep]['frequency']['stop'] = action.value
      })

    case 'dds/toggle':
      const ddsChecked = state['dds'][action.channel][action.timestep]['on']
      return produce(state, draft => {
        draft['dds'][action.channel][action.timestep]['on'] = !ddsChecked
      })

    case 'sequence/retrieve':
      return produce(state, draft => {
        draft['sequence'] = draft['sequences'][action.name]
        draft['active_sequence'] = action.name
      })

    case 'sequence/store':
      return produce(state, draft => {
        draft['sequences'][action.name] = draft['sequence']
        draft['active_sequence'] = action.name
      })

    case 'timestep/delete':
      return produce(state, draft => {
        for (let channel of state['channels'].TTL) {
          draft['ttl'][channel].splice(action.timestep, 1)
        }
        for (let channel of state['channels'].DAC) {
          draft['dac'][channel].splice(action.timestep, 1)
        }
        for (let channel of state['channels'].DDS) {
          draft['dds'][channel].splice(action.timestep, 1)
        }
        for (let channel of state['channels'].ADC) {
          draft['adc'][channel].splice(action.timestep, 1)
        }

        draft['duration'].splice(action.timestep, 1)

      })

    case 'timestep/duration':
      return produce(state, draft => {
        draft['duration'][action.timestep] = action.duration
      })

    case 'timestep/insert':
      return produce(state, draft => {
        for (let channel of state['channels'].TTL) {
          draft['ttl'][channel].splice(action.timestep+1, 0, false)
        }
        for (let channel of state['channels'].DAC) {
          draft['dac'][channel].splice(action.timestep+1, 0, {'mode': 'constant', 'setpoint': '', 'start': '', 'stop': ''})
        }
        for (let channel of state['channels'].DDS) {
          draft['dds'][channel].splice(action.timestep+1, 0, {'frequency': {'mode': 'constant', 'setpoint': '', 'start': '', 'stop': ''},
                                     'attenuation': {'mode': 'constant', 'setpoint': '', 'start': '', 'stop': ''},
                                     'on': false})
        }
        for (let channel of state['channels'].ADC) {
          draft['adc'][channel].splice(action.timestep+1, 0, {'samples': '', 'on': false})
        }

        draft['duration'].splice(action.timestep+1, 0, '1')
        draft['timestep_scales'].splice(action.timestep+1, 0, 1)

      })

    case 'timestep/swap':
      return produce(state, draft => {
        let a = action.a
        let b = action.b
        swap(draft['duration'], a, b)
        swap(draft['timestep_scales'], a, b)
        for (let channel of state['channels'].TTL) {
          swap(draft['ttl'][channel], a, b)
        }
        for (let channel of state['channels'].DAC) {
          swap(draft['dac'][channel], a, b)
        }
        for (let channel of state['channels'].DDS) {
          swap(draft['dds'][channel], a, b)
        }
        for (let channel of state['channels'].ADC) {
          swap(draft['adc'][channel], a, b)
        }
      })

    case 'timestep/scale':
      return produce(state, draft => {
        draft['timestep_scales'][action.timestep] = action.value
      })

    case 'ttl/toggle':
      let ttlChecked = state['ttl'][action.channel][action.timestep]

      return produce(state, draft => {
        draft['ttl'][action.channel][action.timestep] = !ttlChecked
      })

    }
}
