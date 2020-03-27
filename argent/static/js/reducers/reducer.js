import produce from 'immer'

export default function reducer(state=[], action) {
  switch(action.type) {
    default : return state;

    case 'adc/samples':
      return produce(state, draft => {
        draft['sequence'][action.timestep]['adc'][action.channel]['samples'] = action.value
      })

    case 'adc/toggle':
      let checked = state['sequence'][action.timestep]['adc'][action.channel]['on']
      return produce(state, draft => {
        draft['sequence'][action.timestep]['adc'][action.channel]['on'] = !checked
      })

    case 'dac/mode':
      return produce(state, draft => {
        draft['sequence'][action.timestep]['dac'][action.channel]['mode'] = action.value
      })

    case 'dac/setpoint':
      return produce(state, draft => {
        draft['sequence'][action.timestep]['dac'][action.channel]['setpoint'] = action.value
      })

    case 'dac/start':
      return produce(state, draft => {
        draft['sequence'][action.timestep]['dac'][action.channel]['start'] = action.value
      })

    case 'dac/stop':
      return produce(state, draft => {
        draft['sequence'][action.timestep]['dac'][action.channel]['stop'] = action.value
      })

    case 'dds/attenuation/mode':
      return produce(state, draft => {
        draft['sequence'][action.timestep]['dds'][action.channel]['attenuation']['mode'] = action.value
      })

    case 'dds/attenuation/setpoint':
      return produce(state, draft => {
        draft['sequence'][action.timestep]['dds'][action.channel]['attenuation']['setpoint'] = action.value
      })

    case 'dds/attenuation/start':
      return produce(state, draft => {
        draft['sequence'][action.timestep]['dds'][action.channel]['attenuation']['start'] = action.value
      })

    case 'dds/attenuation/stop':
      return produce(state, draft => {
        draft['sequence'][action.timestep]['dds'][action.channel]['attenuation']['stop'] = action.value
      })

    case 'dds/frequency/mode':
      return produce(state, draft => {
        draft['sequence'][action.timestep]['dds'][action.channel]['frequency']['mode'] = action.value
      })

    case 'dds/frequency/setpoint':
      return produce(state, draft => {
        draft['sequence'][action.timestep]['dds'][action.channel]['frequency']['setpoint'] = action.value
      })

    case 'dds/frequency/start':
      return produce(state, draft => {
        draft['sequence'][action.timestep]['dds'][action.channel]['frequency']['start'] = action.value
      })

    case 'dds/frequency/stop':
      return produce(state, draft => {
        draft['sequence'][action.timestep]['dds'][action.channel]['frequency']['stop'] = action.value
      })

    case 'dds/toggle':
      const ddsChecked = state['sequence'][action.timestep]['dds'][action.channel]['on']
      return produce(state, draft => {
        draft['sequence'][action.timestep]['dds'][action.channel]['on'] = !ddsChecked
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
        draft['sequence'].splice(action.timestep, 1)
      })

    case 'timestep/duration':
      return produce(state, draft => {
        draft['sequence'][action.timestep]['duration'] = action.duration
      })

    case 'timestep/insert':
      return produce(state, draft => {
        const newStep = {'ttl': {}, 'dac': {}, 'dds': {}, 'adc': {}, 'duration': '1'}

        for (let channel of state['channels'].TTL) {
          newStep['ttl'][channel] = false
        }
        for (let channel of state['channels'].DAC) {
          newStep['dac'][channel] = {'mode': 'constant', 'setpoint': '', 'start': '', 'stop': ''}
        }
        for (let channel of state['channels'].DDS) {
          newStep['dds'][channel] = {'frequency': {'mode': 'constant', 'setpoint': '', 'start': '', 'stop': ''},
                                     'attenuation': {'mode': 'constant', 'setpoint': '', 'start': '', 'stop': ''},
                                     'on': false}
        }
        for (let channel of state['channels'].ADC) {
          newStep['adc'][channel] = {'samples': '', 'on': false}
        }

        draft['sequence'].splice(action.timestep+1, 0, newStep)
        draft['timestep_scales'].splice(action.timestep+1, 0, 1)
      })

    case 'timestep/moveLeft':
      return produce(state, draft => {
        let t = action.timestep
        let prev = action.timestep - 1
        let temp = draft['sequence'][prev]
        draft['sequence'][prev] = draft['sequence'][t]
        draft['sequence'][t] = temp

        temp = draft['timestep_scales'][prev]
        draft['timestep_scales'][prev] = draft['timestep_scales'][t]
        draft['timestep_scales'][t] = temp

      })

    case 'timestep/moveRight':
      return produce(state, draft => {
        let t = action.timestep
        let next = action.timestep + 1
        let temp = draft['sequence'][next]
        draft['sequence'][next] = draft['sequence'][t]
        draft['sequence'][t] = temp

        temp = draft['timestep_scales'][next]
        draft['timestep_scales'][next] = draft['timestep_scales'][t]
        draft['timestep_scales'][t] = temp

      })

    case 'timestep/scale':
      return produce(state, draft => {
        draft['timestep_scales'][action.timestep] = action.value
      })

    case 'ttl/toggle':
      let ttlChecked = state['sequence'][action.timestep]['ttl'][action.channel]
      return produce(state, draft => {
        draft['sequence'][action.timestep]['ttl'][action.channel] = !ttlChecked
      })

    }
}
