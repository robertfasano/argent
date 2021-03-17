import produce from 'immer'
import { defaultSequence } from '../../index.jsx'

function swap (array, a, b) {
  // Swaps elements with indices a and b of a passed array in place
  const temp = array[a]
  array[a] = array[b]
  array[b] = temp
}

export default function reducer (state = [], action) {
  switch (action.type) {
    case 'dac/setpoint':
      // Update a DAC setpoint for a given timestep and channel. The setpoint string
      // is unitful, e.g. '1 V' or '0.3 mV'. If the value part of the setpoint string
      // is not defined, remove the channel from the timestep's 'dac' field.
      return produce(state, draft => {
        draft.sequences[action.sequenceName][action.timestep].dac[action.board][action.ch] = action.voltage
        if (action.voltage.split(' ')[0] === '') {
          delete draft.sequences[action.sequenceName][action.timestep].dac[action.board][action.ch]
        }
      })

    case 'macrosequence/append':
      // Append a sequence to the master sequence.
      return produce(state, draft => {
        draft.macrosequence.push(action.sequence)
      })

    case 'macrosequence/insert':
      // Insert a new sequence in the master sequence. The inserted sequence is
      // a duplicate of the previous one, or the next one if inserted in the
      // first stage.
      return produce(state, draft => {
        if (action.timestep === -1) {
          action.timestep = 0
        }
        const newTimestep = draft.macrosequence[action.timestep]
        draft.macrosequence.splice(action.timestep + 1, 0, newTimestep)
      })

    case 'macrosequence/remove':
      // Remove a sequence from the master sequence.
      return produce(state, draft => {
        draft.macrosequence.splice(action.index, 1)
      })

    case 'macrosequence/swap':
      // Swap two stages in the master sequence.
      return produce(state, draft => {
        swap(draft.macrosequence, action.a, action.b)
      })

    case 'macrosequence/updateReps':
      // Update the number of reps for a given stage of the master sequence.
      return produce(state, draft => {
        draft.macrosequence[action.index].reps = action.reps
      })

    case 'macrosequence/updateSequence':
      // Choose which sequence is run in a given stage of the master sequence.
      return produce(state, draft => {
        draft.macrosequence[action.index].name = action.name
        draft.macrosequence[action.index].reps = 1
      })

    case 'sequence/close':
      // Close the tab for a given sequence, removing it from state.sequences.
      // Sequences contained in the master sequence cannot be closed.
      return produce(state, draft => {
        // check if the sequence is used in the master sequence
        let found = false
        for (const stage of draft.macrosequence) {
          if (stage.name === action.name) {
            found = true
          }
        }
        if (found) {
          alert('Cannot delete a sequence which is used in the master sequence!')
        } else {
          const currentIndex = Object.keys(draft.sequences).indexOf(action.name)
          let newIndex = currentIndex - 1
          if (newIndex < 0) {
            newIndex = 0
          }

          delete draft.sequences[action.name]

          if (action.name === draft.active_sequence) {
            draft.active_sequence = Object.keys(draft.sequences)[newIndex]
          }
        }
      })

    case 'sequence/load':
      // Store a passed sequence object in state.sequences.
      return produce(state, draft => {
        draft.sequences[action.name] = action.sequence
        draft.active_sequence = action.name
      })

    case 'sequence/rename':
      // Rename a sequence.
      return produce(state, draft => {
        // rename active sequence if necessary
        if (draft.active_sequence === action.name) {
          draft.active_sequence = action.newName
        }
        // rename all occurrences in macrosequence
        for (const stage of draft.macrosequence) {
          if (stage.name === action.name) {
            stage.name = action.newName
          }
        }
        // rename in the 'sequences' store, preserving key order
        const newSequences = {}
        for (const [key, val] of Object.entries(draft.sequences)) {
          if (key === action.name) {
            newSequences[action.newName] = val
          } else {
            newSequences[key] = val
          }
        }
        draft.sequences = newSequences
      })

    case 'sequence/setActive':
      // Set a sequence to the active sequence, which is used to choose
      // which sequence to display for editing or send to the code generator.
      return produce(state, draft => {
        draft.active_sequence = action.name
      })

    case 'timestep/delete':
      // Remove a timestep from a sequence at a given index.
      return produce(state, draft => {
        const sequenceName = action.sequenceName || state.active_sequence
        draft.sequences[sequenceName].splice(action.timestep, 1)
      })

    case 'timestep/duration':
      // Modify a timestep duration at a given index.
      return produce(state, draft => {
        const sequenceName = action.sequenceName || state.active_sequence
        draft.sequences[sequenceName][action.timestep].duration = action.duration
      })

    case 'timestep/insert':
      // Insert a timestep at a given index. The new timestep inherits all boolean
      // states from the previous timestep. In other words, all TTL channels and
      // DDS rf switches will preserve the previous state, but no other states
      // will be updated by default.
      return produce(state, draft => {

        const sequenceName = action.sequenceName || state.active_sequence
        const newTimestep = defaultSequence(state.channels)[0]
        const previousIndex = Math.max(action.timestep-1, 0)
        const previousTimestep = state.sequences[sequenceName][previousIndex]
        for (const ch of Object.keys(previousTimestep.ttl)) {
          newTimestep.ttl[ch] = previousTimestep.ttl[ch]
        }
        for (const ch of Object.keys(previousTimestep.dds)) {
          newTimestep.dds[ch].enable = previousTimestep.dds[ch].enable
        }
        draft.sequences[sequenceName].splice(action.timestep + 1, 0, newTimestep)
      })

    case 'timestep/swap':
      // Swap two timesteps.
      return produce(state, draft => {
        const sequenceName = action.sequenceName || state.active_sequence
        swap(draft.sequences[sequenceName], action.a, action.b)
      })

    case 'ttl/toggle':
      // Toggle a TTL event on/off.
      return produce(state, draft => {
        const sequenceName = action.sequenceName || state.active_sequence
        const ttlChecked = state.sequences[sequenceName][action.timestep].ttl[action.channel]
        draft.sequences[sequenceName][action.timestep].ttl[action.channel] = !ttlChecked
      })

    case 'ui/setActive':
      // Designate a given channel as active. Inactive channels will not be
      // rendered or sent to the code generator, allowing users to avoid
      // accessing certain channels on the hardware, e.g. to persist a setpoint
      // from a previous experiment.
      return produce(state, draft => {
        const newChannels = []
        for (const ch of state.channels[action.channelType]) {
          if (ch === action.channel || state.ui.channels[action.channelType].includes(ch)) {
            newChannels.push(ch)
          }
        }
        draft.ui.channels[action.channelType] = newChannels
      })

    case 'ui/setInactive':
      // Designate a channel as inactive.
      return produce(state, draft => {
        draft.ui.channels[action.channel_type] = draft.ui.channels[action.channel_type].filter(e => e !== action.channel)
      })

    case 'ui/setOthersInactive':
      // Designate channels other than the selected one as inactive.
      return produce(state, draft => {
        draft.ui.channels[action.channel_type] = draft.ui.channels[action.channel_type].filter(e => e === action.channel)
      })

    case 'ui/setBelowInactive':
      // Designate channels listed after the selected one as inactive.
      return produce(state, draft => {
        const index = draft.ui.channels[action.channel_type].indexOf(action.channel)
        draft.ui.channels[action.channel_type] = draft.ui.channels[action.channel_type].slice(0, index + 1)
      })

    default : return state
  }
}
