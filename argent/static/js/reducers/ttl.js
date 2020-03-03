import produce from 'immer'

export default function reducer(state=[], action) {
  switch(action.type) {
    default : return state;
    case 'ttl/check':
      return produce(state, draft => {
        draft[action.timestep] = draft[action.timestep].concat(action.channel)
        draft[action.timestep] = [...new Set(draft[action.timestep])]
      })
      case 'ttl/uncheck':
        return produce(state, draft => {
          draft[action.timestep] = draft[action.timestep].filter(value => value != action.channel)
        })
      case 'ttl/toggle':
        const checked = state[action.timestep].includes(action.channel)
        if (checked) {
          return reducer(state=state, action={'type': 'ttl/uncheck', 'channel': action.channel, 'timestep': action.timestep})
        }
        else {
          return reducer(state=state, action={'type': 'ttl/check', 'channel': action.channel, 'timestep': action.timestep})
        }
    }
}


export function toggle(timestep, channel) {
  return {type: 'ttl/toggle', timestep: timestep, channel: channel}
}
