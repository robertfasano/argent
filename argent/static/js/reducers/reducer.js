import produce from 'immer'

export default function reducer(state=[], action) {
  switch(action.type) {
    default : return state;

    case 'adc/toggle':
      let checked = state['sequence'][action.timestep]['adc'][action.channel]['on']
      return produce(state, draft => {
        draft['sequence'][action.timestep]['adc'][action.channel]['on'] = !checked
      })

    case 'adc/updateSamples':
      return produce(state, draft => {
        draft['sequence'][action.timestep]['adc'][action.channel]['samples'] = action.value
      })

    case 'ttl/check':
      return produce(state, draft => {
        draft['sequence'][action.timestep]['ttl'][action.channel] = true
      })

      case 'ttl/uncheck':
        return produce(state, draft => {
          draft['sequence'][action.timestep]['ttl'][action.channel] = false
        })

      case 'ttl/toggle':
        let ttlChecked = state['sequence'][action.timestep]['ttl'][action.channel]
        if (ttlChecked) {
          return reducer(state=state, action={'type': 'ttl/uncheck', 'channel': action.channel, 'timestep': action.timestep})
        }
        else {
          return reducer(state=state, action={'type': 'ttl/check', 'channel': action.channel, 'timestep': action.timestep})
        }

      case 'dac/update':
        return produce(state, draft => {
          draft['sequence'][action.timestep]['dac'][action.channel] = action.value
        })

      case 'dds/updateAttenuation':
        return produce(state, draft => {
          draft['sequence'][action.timestep]['dds'][action.channel]['attenuation'] = action.value
        })

      case 'dds/updateFrequency':
        return produce(state, draft => {
          draft['sequence'][action.timestep]['dds'][action.channel]['frequency'] = action.value
        })

      case 'dds/check':
        return produce(state, draft => {
          draft['sequence'][action.timestep]['dds'][action.channel]['on'] = true
        })

      case 'dds/uncheck':
        return produce(state, draft => {
          draft['sequence'][action.timestep]['dds'][action.channel]['on'] = false
        })

      case 'dds/toggle':
        const ddsChecked = state['sequence'][action.timestep]['dds'][action.channel]['on']

        if (ddsChecked) {
          return reducer(state=state, action={'type': 'dds/uncheck', 'channel': action.channel, 'timestep': action.timestep})
        }
        else {
          return reducer(state=state, action={'type': 'dds/check', 'channel': action.channel, 'timestep': action.timestep})
        }


      case 'timing/update':
        return produce(state, draft => {
          draft['sequence'][action.timestep]['duration'] = action.duration
        })

      case 'timing/append':
        return produce(state, draft => {
          const newStep = {'ttl': {}, 'dac': {}, 'dds': {}, 'adc': {}, 'duration': 1}

          for (let channel of state['channels'].TTL) {
            newStep['ttl'][channel] = false
          }
          for (let channel of state['channels'].DAC) {
            newStep['dac'][channel] = ''
          }
          for (let channel of state['channels'].DDS) {
            newStep['dds'][channel] = {'frequency': '', 'attenuation': '', 'on': false}
          }
          for (let channel of state['channels'].ADC) {
            newStep['adc'][channel] = {'samples': '', 'on': false}
          }

          draft['sequence'] = draft['sequence'].concat(newStep)
        })

    }
}


function toggleADC(timestep, channel) {
  return {type: 'adc/toggle', timestep: timestep, channel: channel}
}

function updateADCSamples(timestep, channel, value) {
  return {type: 'adc/updateSamples', timestep: timestep, channel: channel, value: value}
}

function toggleTTL(timestep, channel) {
  return {type: 'ttl/toggle', timestep: timestep, channel: channel}
}

function updateDAC(timestep, channel, value) {
  return {type: 'dac/update', timestep: timestep, channel: channel, value: value}
}

export function toggleDDS(timestep, channel) {
  return {type: 'dds/toggle', timestep: timestep, channel: channel}
}

export function updateAttenuation(timestep, channel, value) {
  return {type: 'dds/updateAttenuation', timestep: timestep, channel: channel, value: value}
}

export function updateFrequency(timestep, channel, value) {
  return {type: 'dds/updateFrequency', timestep: timestep, channel: channel, value: value}
}

export function updateTimestep(timestep, duration) {
  return {type: 'timing/update', timestep: timestep, duration: duration}
}

export function appendTimestep() {
  return {type: 'timing/append'}
}

const actions = {'adc': {'toggle': toggleADC,
                         'samples': {'update': updateADCSamples}
                        },
                'ttl': {'toggle': toggleTTL},
                 'dac': {'update': updateDAC},
                 'dds': {'frequency': {'update': updateFrequency},
                         'attenuation': {'update': updateAttenuation},
                         'toggle': toggleDDS
                       },
                 'timing': {'update': updateTimestep,
                            'append': appendTimestep
                          }


               }

export {actions}
