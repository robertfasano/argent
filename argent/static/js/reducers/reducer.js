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

      case 'timing/moveLeft':
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

      case 'timing/moveRight':
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

      case 'timing/delete':
        return produce(state, draft => {
          draft['sequence'].splice(action.timestep, 1)
        })
        
      case 'timing/update':
        return produce(state, draft => {
          draft['sequence'][action.timestep]['duration'] = action.duration
        })

      case 'timing/insert':
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

          draft['sequence'].splice(action.timestep+1, 0, newStep)
          draft['timestep_scales'].splice(action.timestep+1, 0, 1)
        })

      case 'scale/update':
        return produce(state, draft => {
          draft['timestep_scales'][action.timestep] = action.value
        })
    }
}


function toggleADC(timestep, channel) {
  return {type: 'adc/toggle', timestep: timestep, channel: channel}
}

function updateADCSamples(timestep, channel, value) {
  return {type: 'adc/updateSamples', timestep: timestep, channel: channel, value: value}
}

function updateScale(timestep, value) {
  return {type: 'scale/update', timestep: timestep, value: value}
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

export function insertTimestep(timestep) {
  return {type: 'timing/insert', timestep: timestep}
}

export function deleteTimestep(timestep) {
  return {type: 'timing/delete', timestep: timestep}
}

export function moveLeft(timestep) {
  return {type: 'timing/moveLeft', timestep: timestep}
}

export function moveRight(timestep) {
  return {type: 'timing/moveRight', timestep: timestep}
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
                            'insert': insertTimestep,
                            'delete': deleteTimestep,
                            'moveLeft': moveLeft,
                            'moveRight': moveRight
                          },
                'scale': {'update': updateScale}
               }

export {actions}
