import produce from 'immer'

function swap(array, a, b) {
  // Swaps elements with indices a and b of a passed array in place
  let temp = array[a]
  array[a] = array[b]
  array[b] = temp
}

function getSequenceName(state, action) {
  let sequence_name = action.sequence_name
  if (typeof sequence_name == 'undefined') {
    sequence_name = state['active_sequence']
  }
  return sequence_name
}

export default function reducer(state=[], action) {
  switch(action.type) {
    default : return state;

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
        let sequence_name = getSequenceName(state, action)
        draft['sequences'][sequence_name].splice(action.timestep, 1)
      })

    case 'timestep/duration':
      return produce(state, draft => {
        let sequence_name = getSequenceName(state, action)
        draft['sequences'][sequence_name][action.timestep]['duration'] = action.duration
      })

    case 'timestep/insert':
      return produce(state, draft => {
        let sequence_name = getSequenceName(state, action)
        let new_timestep = {duration: '1', ttl: {}, time_scale: 1}
        for (let channel of state['channels'].TTL) {
          new_timestep['ttl'][channel] = {'state': false}
        }

        draft['sequences'][sequence_name].splice(action.timestep+1, 0, new_timestep)
      })

    case 'timestep/swap':
      return produce(state, draft => {
        let sequence_name = getSequenceName(state, action)
        let a = action.a
        let b = action.b
        swap(draft['sequences'][sequence_name], a, b)
      })

    case 'timestep/scale':
      return produce(state, draft => {
        let sequence_name = getSequenceName(state, action)
        draft['sequences'][sequence_name][action.timestep]['time_scale'] = action.value
      })


    case 'ttl/toggle':
      let sequence_name = getSequenceName(state, action)
      let ttlChecked = state['sequences'][sequence_name][action.timestep]['ttl'][action.channel].state
      return produce(state, draft => {
        draft['sequences'][sequence_name][action.timestep]['ttl'][action.channel]['state'] = !ttlChecked
      })

    }
}
