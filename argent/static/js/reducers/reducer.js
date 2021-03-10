import produce from 'immer'
import omitDeep from 'omit-deep-lodash'
import flatten from 'flat'
import _ from 'lodash'

function swap(array, a, b) {
  // Swaps elements with indices a and b of a passed array in place
  let temp = array[a]
  array[a] = array[b]
  array[b] = temp
}

function getSequenceName(state, action) {
  let sequenceName = action.sequenceName
  if (typeof sequenceName == 'undefined') {
    sequenceName = state['active_sequence']
  }
  return sequenceName
}

export default function reducer(state=[], action) {
  switch(action.type) {
    default : return state;

    case 'dac/setpoint':
    return produce(state, draft => {
      draft['sequences'][action.sequenceName][action.timestep].dac[action.board][action.ch] = action.voltage
      if (action.voltage.split(' ')[0] == '') {
        delete draft['sequences'][action.sequenceName][action.timestep].dac[action.board][action.ch]
      }
    })

    case 'macrosequence/append':
      return produce(state, draft => {
        draft['macrosequence'].push(action.sequence)
      })

    case 'macrosequence/insert':
      return produce(state, draft => {
        if (action.timestep == -1) {
          action.timestep = 0
        }
        let new_timestep = draft['macrosequence'][action.timestep]
        draft['macrosequence'].splice(action.timestep+1, 0, new_timestep)
      })

    case 'macrosequence/remove':
      return produce(state, draft => {
        draft['macrosequence'].splice(action.index, 1)
      })

      case 'macrosequence/swap':
        return produce(state, draft => {
          let a = action.a
          let b = action.b
          swap(draft['macrosequence'], a, b)
        })

      case 'macrosequence/updateReps':
        return produce(state, draft => {
          draft['macrosequence'][action.index].reps = action.reps
        })

      case 'macrosequence/updateSequence':
        return produce(state, draft => {
          draft['macrosequence'][action.index].name = action.name
          draft['macrosequence'][action.index].reps = 1
        })

      case 'sequence/close':
        return produce(state, draft => {
          // check if the sequence is used in the master sequence
          let found = false
          for (let stage of draft['macrosequence']) {
            if (stage.name == action.name) {
              found = true
            }
          }

          if (found) {
            alert('Cannot delete a sequence which is used in the master sequence!')
          }
          else {
            let currentIndex = Object.keys(draft['sequences']).indexOf(action.name)
            let newIndex = currentIndex-1
            if (newIndex < 0) {
              newIndex = 0
            }

            delete draft['sequences'][action.name]

            if (action.name == draft['active_sequence']) {
              draft['active_sequence'] = Object.keys(draft['sequences'])[newIndex]
            }
          }


        })

    case 'sequence/load':
      return produce(state, draft => {
        draft['sequences'][action.name] = action.sequence
        draft['active_sequence'] = action.name
        console.log('Loaded sequence:', action.name)
      })

    case 'sequence/rename':
      return produce(state, draft => {
        // rename active sequence if necessary
        if (draft['active_sequence'] == action.name) {
          draft['active_sequence'] = action.newName
        }
        // rename all occurrences in macrosequence
        for (let stage of draft['macrosequence']) {
          if (stage.name == action.name) {
            stage.name = action.newName
          }
        }
        // rename in the 'sequences' store, preserving key order
        let newSequences = {}
        for (const [key, val] of Object.entries(draft['sequences'])) {
          if (key == action.name) {
            newSequences[action.newName] = val
          }
          else {
            newSequences[key] = val
          }
        }
        draft['sequences'] = newSequences
      })

    case 'sequence/retrieve':
      return produce(state, draft => {
        draft['active_sequence'] = action.name
      })

    case 'timestep/delete':
      return produce(state, draft => {
        let sequenceName = getSequenceName(state, action)
        draft['sequences'][sequenceName].splice(action.timestep, 1)
      })

    case 'timestep/duration':
      return produce(state, draft => {
        let sequenceName = getSequenceName(state, action)
        draft['sequences'][sequenceName][action.timestep]['duration'] = action.duration
      })

    case 'timestep/insert':
      return produce(state, draft => {
        console.log('Inserting timestep')
        let sequenceName = getSequenceName(state, action)
        let new_timestep = {duration: '1 s', ttl: {}, dac: {}}
        for (let channel of state['channels'].TTL) {
          new_timestep['ttl'][channel] = false
        }
        for (let board of Object.keys(state['channels'].DAC)) {
          // new_timestep['dac'][board] = Array(32).fill('')
          new_timestep['dac'][board] = {}
        }

        draft['sequences'][sequenceName].splice(action.timestep+1, 0, new_timestep)
      })

    case 'timestep/swap':
      return produce(state, draft => {
        let sequenceName = getSequenceName(state, action)
        let a = action.a
        let b = action.b
        swap(draft['sequences'][sequenceName], a, b)
      })

    case 'ttl/toggle':
      let sequenceName = getSequenceName(state, action)
      let ttlChecked = state['sequences'][sequenceName][action.timestep]['ttl'][action.channel]
      return produce(state, draft => {
        draft['sequences'][sequenceName][action.timestep]['ttl'][action.channel] = !ttlChecked
      })

    case 'ui/setActive':
      return produce(state, draft => {
        // action.channel_type, action.channel
        let newChannels = []
        for (let ch of state.channels[action.channelType]) {
          if (ch == action.channel || state.ui.channels[action.channelType].includes(ch)) {
            newChannels.push(ch)
          }
        }
        draft.ui.channels[action.channelType] = newChannels

      })

    case 'ui/setInactive':
      return produce(state, draft => {
        draft.ui.channels[action.channel_type] = draft.ui.channels[action.channel_type].filter(e => e != action.channel)
      })

    case 'ui/setOthersInactive':
      return produce(state, draft => {
        draft.ui.channels[action.channel_type] = draft.ui.channels[action.channel_type].filter(e => e == action.channel)
      })

    case 'ui/setBelowInactive':
      return produce(state, draft => {
        let index = draft.ui.channels[action.channel_type].indexOf(action.channel)
        draft.ui.channels[action.channel_type] = draft.ui.channels[action.channel_type].slice(0, index+1)
      })

    }

}
