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

    case 'adc/reserve':
      return produce(state, draft => {
        draft['sequence']['adc'][action.channel][action.timestep]['reserved'] = action.value
      })

    case 'adc/samples':
      return produce(state, draft => {
        draft['sequence']['adc'][action.channel][action.timestep]['samples'] = action.value
      })

    case 'adc/toggle':
      let checked = state['sequence']['adc'][action.channel][action.timestep]['on']
      return produce(state, draft => {
        draft['sequence']['adc'][action.channel][action.timestep]['on'] = !checked
      })

    case 'adc/variable':
      return produce(state, draft => {
        draft['sequence']['adc'][action.channel][action.timestep]['variable'] = action.value
      })

    case 'config/sequence_library':
      return produce(state, draft => {
        draft['config'].sequence_library = action.value
      })

    case 'config/device_db':
      return produce(state, draft => {
        draft['config'].device_db = action.value
      })

    case 'controls/paused':
      return produce(state, draft => {
        draft['controls'].paused = action.value
      })

      case 'controls/update':
      return produce(state, draft => {
        for (let name of Object.keys(action.data)) {
          draft['controls'][name] = action.data[name]
        }
      })

    case 'dac/mode':
      return produce(state, draft => {
        draft['sequence']['dac'][action.channel][action.timestep]['mode'] = action.value
      })

    case 'dac/reserve':
      return produce(state, draft => {
        draft['sequence']['dac'][action.channel][action.timestep]['reserved'] = action.value
      })

    case 'dac/setpoint':
      return produce(state, draft => {
        draft['sequence']['dac'][action.channel][action.timestep]['setpoint'] = action.value
      })

    case 'dac/start':
      return produce(state, draft => {
        draft['sequence']['dac'][action.channel][action.timestep]['start'] = action.value
      })

    case 'dac/steps':
      return produce(state, draft => {
        draft['sequence']['dac'][action.channel][action.timestep]['steps'] = action.value
      })

    case 'dac/stop':
      return produce(state, draft => {
        draft['sequence']['dac'][action.channel][action.timestep]['stop'] = action.value
      })

    case 'dds/attenuation/mode':
      return produce(state, draft => {
        draft['sequence']['dds'][action.channel][action.timestep]['attenuation']['mode'] = action.value
      })

    case 'dds/attenuation/setpoint':
      return produce(state, draft => {
        draft['sequence']['dds'][action.channel][action.timestep]['attenuation']['setpoint'] = action.value
      })

    case 'dds/attenuation/start':
      return produce(state, draft => {
        draft['sequence']['dds'][action.channel][action.timestep]['attenuation']['start'] = action.value
      })

    case 'dds/attenuation/steps':
      return produce(state, draft => {
        draft['sequence']['dds'][action.channel][action.timestep]['attenuation']['steps'] = action.value
      })

    case 'dds/attenuation/stop':
      return produce(state, draft => {
        draft['sequence']['dds'][action.channel][action.timestep]['attenuation']['stop'] = action.value
      })

    case 'dds/frequency/mode':
      return produce(state, draft => {
        draft['sequence']['dds'][action.channel][action.timestep]['frequency']['mode'] = action.value
      })

    case 'dds/frequency/setpoint':
      return produce(state, draft => {
        draft['sequence']['dds'][action.channel][action.timestep]['frequency']['setpoint'] = action.value
      })

    case 'dds/frequency/start':
      return produce(state, draft => {
        draft['sequence']['dds'][action.channel][action.timestep]['frequency']['start'] = action.value
      })

    case 'dds/frequency/steps':
      return produce(state, draft => {
        draft['sequence']['dds'][action.channel][action.timestep]['frequency']['steps'] = action.value
      })

    case 'dds/frequency/stop':
      return produce(state, draft => {
        draft['sequence']['dds'][action.channel][action.timestep]['frequency']['stop'] = action.value
      })

    case 'dds/reserve':
      return produce(state, draft => {
        draft['sequence']['dds'][action.channel][action.timestep]['reserved'] = action.value
      })

    case 'dds/toggle':
      const ddsChecked = state['sequence']['dds'][action.channel][action.timestep]['on']
      return produce(state, draft => {
        draft['sequence']['dds'][action.channel][action.timestep]['on'] = !ddsChecked
      })

    case 'scripts/function':
      return produce(state, draft => {
        draft['sequence']['script'][action.timestep]['function'] = action.value
      })

    case 'scripts/list':
    return produce(state, draft => {
      draft['scripts'] = action.scripts
    })

    case 'scripts/module':
    return produce(state, draft => {
      draft['sequence']['script'][action.timestep]['module'] = action.value
    })

    case 'sequence/load':
      return produce(state, draft => {
        draft['sequences'][action.name] = action.sequence
        draft['active_sequence'] = action.name
        draft['sequence'] = action.sequence
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
          draft['sequence']['ttl'][channel].splice(action.timestep, 1)
        }
        for (let channel of state['channels'].DAC) {
          draft['sequence']['dac'][channel].splice(action.timestep, 1)
        }
        for (let channel of state['channels'].DDS) {
          draft['sequence']['dds'][channel].splice(action.timestep, 1)
        }
        for (let channel of state['channels'].ADC) {
          draft['sequence']['adc'][channel].splice(action.timestep, 1)
        }

        draft['sequence']['duration'].splice(action.timestep, 1)

      })

    case 'timestep/duration':
      return produce(state, draft => {
        draft['sequence']['duration'][action.timestep] = action.duration
      })

    case 'timestep/insert':
      return produce(state, draft => {
        for (let channel of state['channels'].TTL) {
          draft['sequence']['ttl'][channel].splice(action.timestep+1, 0, {'state': false, 'reserved': false})
        }
        for (let channel of state['channels'].DAC) {
          draft['sequence']['dac'][channel].splice(action.timestep+1, 0, {'mode': 'constant', 'setpoint': '', 'start': '', 'stop': '', 'reserved': false})
        }
        for (let channel of state['channels'].DDS) {
          draft['sequence']['dds'][channel].splice(action.timestep+1, 0, {'frequency': {'mode': 'constant', 'setpoint': '', 'start': '', 'stop': ''},
                                     'attenuation': {'mode': 'constant', 'setpoint': '', 'start': '', 'stop': ''},
                                     'on': false,
                                     'reserved': false})
        }
        for (let channel of state['channels'].ADC) {
          draft['sequence']['adc'][channel].splice(action.timestep+1, 0, {'samples': '', 'on': false, 'reserved': false, 'variable': ''})
        }

        draft['sequence']['script'].splice(action.timestep+1, 0, {'module': '', 'function': ''})

        draft['sequence']['duration'].splice(action.timestep+1, 0, '1')
        draft['sequence']['timestep_scales'].splice(action.timestep+1, 0, 1)

      })

    case 'timestep/swap':
      return produce(state, draft => {
        let a = action.a
        let b = action.b
        swap(draft['sequence']['duration'], a, b)
        swap(draft['sequence']['timestep_scales'], a, b)
        for (let channel of state['channels'].TTL) {
          swap(draft['sequence']['ttl'][channel], a, b)
        }
        for (let channel of state['channels'].DAC) {
          swap(draft['sequence']['dac'][channel], a, b)
        }
        for (let channel of state['channels'].DDS) {
          swap(draft['sequence']['dds'][channel], a, b)
        }
        for (let channel of state['channels'].ADC) {
          swap(draft['sequence']['adc'][channel], a, b)
        }
      })

    case 'timestep/scale':
      return produce(state, draft => {
        draft['sequence']['timestep_scales'][action.timestep] = action.value
      })

    case 'ttl/reserve':
      return produce(state, draft => {
        draft['sequence']['ttl'][action.channel][action.timestep]['reserved'] = action.value
      })

    case 'ttl/toggle':
      let ttlChecked = state['sequence']['ttl'][action.channel][action.timestep].state

      return produce(state, draft => {
        draft['sequence']['ttl'][action.channel][action.timestep]['state'] = !ttlChecked
      })

    case 'variables/add':
    return produce(state, draft => {
      draft['sequence']['variables'][action.name] = {value: action.value, kind: action.kind, datatype: action.datatype}
    })

    case 'variables/edit':
    return produce(state, draft => {
      draft['sequence']['variables'][action.name].value = action.value
      draft['sequence']['variables'][action.name].kind = action.kind
      draft['sequence']['variables'][action.name].datatype = action.datatype
    })

    case 'variables/update':
    return produce(state, draft => {
      for (let name of Object.keys(action.data)) {
        if (state['sequence']['variables'][name] == null) {
          draft['sequence']['variables'][name] = {}
        }
        draft['sequence']['variables'][name].value = action.data[name].value
        draft['sequence']['variables'][name].kind = action.data[name].kind
        draft['sequence']['variables'][name].datatype = action.data[name].datatype
      }
    })

    }
}
