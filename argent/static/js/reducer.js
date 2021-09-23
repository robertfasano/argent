import produce from 'immer'
import { defaultTimestep, fill } from './schema.js'
import { merge } from 'lodash'

function swap (array, a, b) {
  // Swaps elements with indices a and b of a passed array in place
  const temp = array[a]
  array[a] = array[b]
  array[b] = temp
}

export default function reducer (state = [], action) {
  switch (action.type) {
    case 'adc/delay':
      return produce(state, draft => {
        draft.sequences[state.active_sequence].steps[action.path.timestep].adc[action.path.board].delay = action.value
      })

    case 'adc/duration':
      return produce(state, draft => {
        draft.sequences[state.active_sequence].steps[action.path.timestep].adc[action.path.board].duration = action.value
      })

    case 'adc/samples':
      return produce(state, draft => {
        draft.sequences[state.active_sequence].steps[action.path.timestep].adc[action.path.board].samples = action.value
      })

    case 'adc/toggle':
      return produce(state, draft => {
        const enabled = state.sequences[state.active_sequence].steps[action.path.timestep].adc[action.path.board].enable
        draft.sequences[state.active_sequence].steps[action.path.timestep].adc[action.path.board].enable = !enabled
      })

    case 'adc/outputs/add':
      return produce(state, draft => {
        draft.sequences[state.active_sequence].steps[action.path.timestep].adc[action.path.board].variables[action.value] = { ch: action.path.ch, operation: 'first' }
      })

    case 'adc/outputs/changeChannel':
      return produce(state, draft => {
        draft.sequences[state.active_sequence].steps[action.path.timestep].adc[action.path.board].variables[action.value].ch = action.path.ch
      })

    case 'adc/outputs/remove':
      return produce(state, draft => {
        delete draft.sequences[state.active_sequence].steps[action.path.timestep].adc[action.path.board].variables[action.value]
      })

    case 'adc/outputs/replace':
      return produce(state, draft => {
        const data = draft.sequences[state.active_sequence].steps[action.path.timestep].adc[action.path.board].variables[action.oldOutput]
        delete draft.sequences[state.active_sequence].steps[action.path.timestep].adc[action.path.board].variables[action.oldOutput]
        draft.sequences[state.active_sequence].steps[action.path.timestep].adc[action.path.board].variables[action.newOutput] = data
      })

    case 'adc/outputs/operation':
      return produce(state, draft => {
        draft.sequences[state.active_sequence].steps[action.path.timestep].adc[action.path.board].variables[action.variable].operation = action.operation
      })

    case 'dac/mode':
      return produce(state, draft => {
        draft.sequences[state.active_sequence].steps[action.path.timestep].dac[action.path.board][action.path.ch].mode = action.value
      })

    case 'dac/setpoint':
      return produce(state, draft => {
        draft.sequences[state.active_sequence].steps[action.path.timestep].dac[action.path.board][action.path.ch].setpoint = action.value
      })

    case 'dac/ramp/start':
      return produce(state, draft => {
        draft.sequences[state.active_sequence].steps[action.path.timestep].dac[action.path.board][action.path.ch].ramp.start = action.value
      })

    case 'dac/ramp/stop':
      return produce(state, draft => {
        draft.sequences[state.active_sequence].steps[action.path.timestep].dac[action.path.board][action.path.ch].ramp.stop = action.value
      })

    case 'dac/ramp/steps':
      return produce(state, draft => {
        const channels = Object.keys(state.sequences[state.active_sequence].steps[action.path.timestep].dac[action.path.board])
        for (const ch of channels) {
          draft.sequences[state.active_sequence].steps[action.path.timestep].dac[action.path.board][ch].ramp.steps = action.value
        }
      })

    case 'dds/attenuation/setpoint':
      return produce(state, draft => {
        draft.sequences[state.active_sequence].steps[action.path.timestep].dds[action.path.ch].attenuation.setpoint = action.value
      })

    case 'dds/frequency/setpoint':
      return produce(state, draft => {
        draft.sequences[state.active_sequence].steps[action.path.timestep].dds[action.path.ch].frequency.setpoint = action.value
      })

    case 'dds/frequency/mode':
      return produce(state, draft => {
        draft.sequences[state.active_sequence].steps[action.path.timestep].dds[action.path.ch].frequency.mode = action.value
      })

    case 'dds/attenuation/mode':
      return produce(state, draft => {
        draft.sequences[state.active_sequence].steps[action.path.timestep].dds[action.path.ch].attenuation.mode = action.value
      })

    case 'dds/frequency/ramp/start':
      return produce(state, draft => {
        const ramp = state.sequences[state.active_sequence].steps[action.path.timestep].dds[action.path.ch].frequency.ramp || { start: '', stop: '', steps: 10 }
        draft.sequences[state.active_sequence].steps[action.path.timestep].dds[action.path.ch].frequency.ramp = { ...ramp, start: action.value }
      })

    case 'dds/frequency/ramp/stop':
      return produce(state, draft => {
        const ramp = state.sequences[state.active_sequence].steps[action.path.timestep].dds[action.path.ch].frequency.ramp || { start: '', stop: '', steps: 10 }
        draft.sequences[state.active_sequence].steps[action.path.timestep].dds[action.path.ch].frequency.ramp = { ...ramp, stop: action.value }
      })

    case 'dds/frequency/ramp/steps':
      return produce(state, draft => {
        const ramp = state.sequences[state.active_sequence].steps[action.path.timestep].dds[action.path.ch].frequency.ramp || { start: '', stop: '', steps: 10 }
        draft.sequences[state.active_sequence].steps[action.path.timestep].dds[action.path.ch].frequency.ramp = { ...ramp, steps: action.value }
      })

    case 'dds/attenuation/ramp/start':
      return produce(state, draft => {
        const ramp = state.sequences[state.active_sequence].steps[action.path.timestep].dds[action.path.ch].attenuation.ramp || { start: '', stop: '', steps: 10 }
        draft.sequences[state.active_sequence].steps[action.path.timestep].dds[action.path.ch].attenuation.ramp = { ...ramp, start: action.value }
      })

    case 'dds/attenuation/ramp/stop':
      return produce(state, draft => {
        const ramp = state.sequences[state.active_sequence].steps[action.path.timestep].dds[action.path.ch].attenuation.ramp || { start: '', stop: '', steps: 10 }
        draft.sequences[state.active_sequence].steps[action.path.timestep].dds[action.path.ch].attenuation.ramp = { ...ramp, stop: action.value }
      })

    case 'dds/attenuation/ramp/steps':
      return produce(state, draft => {
        const ramp = state.sequences[state.active_sequence].steps[action.path.timestep].dds[action.path.ch].attenuation.ramp || { start: '', stop: '', steps: 10 }
        draft.sequences[state.active_sequence].steps[action.path.timestep].dds[action.path.ch].attenuation.ramp = { ...ramp, steps: action.value }
      })

    case 'dds/toggle':
      // Toggle a DDS rf switch on or off.
      return produce(state, draft => {
        const ddsEnabled = state.sequences[state.active_sequence].steps[action.path.timestep].dds[action.path.ch].enable
        draft.sequences[state.active_sequence].steps[action.path.timestep].dds[action.path.ch].enable = !ddsEnabled
      })

    case 'playlist/append':
      // Append a sequence to the master sequence.
      return produce(state, draft => {
        draft.playlist.push(action.sequence)
      })

    case 'playlist/insert':
      // Insert a new sequence in the master sequence. The inserted sequence is
      // a duplicate of the previous one, or the next one if inserted in the
      // first stage.
      return produce(state, draft => {
        if (action.timestep === -1) {
          action.timestep = 0
        }
        const newTimestep = draft.playlist[action.timestep]
        draft.playlist.splice(action.timestep + 1, 0, newTimestep)
      })

    case 'playlist/remove':
      // Remove a sequence from the master sequence.
      return produce(state, draft => {
        draft.playlist.splice(action.index, 1)
      })

    case 'playlist/swap':
      // Swap two stages in the master sequence.
      return produce(state, draft => {
        swap(draft.playlist, action.a, action.b)
      })

    case 'playlist/updateReps':
      // Update the number of reps for a given stage of the master sequence.
      return produce(state, draft => {
        draft.playlist[action.index].reps = action.reps
      })

    case 'playlist/updateSequence':
      // Choose which sequence is run in a given stage of the master sequence.
      return produce(state, draft => {
        draft.playlist[action.index].name = action.name
        draft.playlist[action.index].reps = 1
      })

    case 'sequence/close':
      // Close the tab for a given sequence, removing it from state.sequences.
      // Sequences contained in the master sequence cannot be closed.
      return produce(state, draft => {
        // check if the sequence is used in the master sequence
        let found = false
        for (const stage of draft.playlist) {
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
        const sequence = { ...action.sequence, steps: fill(action.sequence.steps, state.channels) }

        for (const [key, val] of Object.entries(sequence.inputs)) {
          draft.inputs[key] = val
        }
        for (const [key, val] of Object.entries(sequence.outputs)) {
          draft.outputs[key] = val
        }
        for (const [key, val] of Object.entries(sequence.variables)) {
          draft.variables[key] = val
        }
        delete sequence.inputs
        delete sequence.outputs
        delete sequence.variables
        draft.sequences[action.name] = sequence
        draft.active_sequence = action.name
      })

    case 'sequence/rename':
      // Rename a sequence.
      return produce(state, draft => {
        // rename active sequence if necessary
        if (draft.active_sequence === action.name) {
          draft.active_sequence = action.newName
        }
        // rename all occurrences in playlist
        for (const stage of draft.playlist) {
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
        draft.sequences[state.active_sequence].steps.splice(action.timestep, 1)
      })

    case 'timestep/duration':
      // Modify a timestep duration at a given index.
      return produce(state, draft => {
        draft.sequences[state.active_sequence].steps[action.timestep].duration = action.duration
      })

    case 'timestep/insert':
      // Insert a timestep at a given index. The new timestep inherits all boolean
      // states from the previous timestep. In other words, all TTL channels and
      // DDS rf switches will preserve the previous state, but no other states
      // will be updated by default.
      return produce(state, draft => {
        const newTimestep = merge({}, defaultTimestep(state.channels))
        const previousTimestep = state.sequences[state.active_sequence].steps[action.timestep]
        console.log(newTimestep, previousTimestep)
        for (const ch of Object.keys(previousTimestep.ttl)) {
          newTimestep.ttl[ch] = previousTimestep.ttl[ch]
        }
        for (const ch of Object.keys(previousTimestep.dds)) {
          newTimestep.dds[ch].enable = previousTimestep.dds[ch].enable
        }
        draft.sequences[state.active_sequence].steps.splice(action.timestep + 1, 0, newTimestep)
      })

    case 'timestep/swap':
      // Swap two timesteps.
      return produce(state, draft => {
        swap(draft.sequences[state.active_sequence].steps, action.a, action.b)
      })

    case 'ttl/toggle':
      // Toggle a TTL event on/off.
      return produce(state, draft => {
        const ttlChecked = state.sequences[state.active_sequence].steps[action.path.timestep].ttl[action.path.channel]
        draft.sequences[state.active_sequence].steps[action.path.timestep].ttl[action.path.channel] = !ttlChecked
      })

    case 'ui/heartbeat':
      // Toggle the heartbeat state
      return produce(state, draft => {
        draft.ui.heartbeat = !state.ui.heartbeat
        draft.ui.pid.active = action.pid
      })

    case 'ui/pid':
      // Toggle the heartbeat state
      return produce(state, draft => {
        draft.ui.pid.submitted = action.value
      })

    case 'ui/changeVariableTab':
      return produce(state, draft => {
        draft.ui.variableTab = action.name
      })

    case 'variables/output/update':
      return produce(state, draft => {
        // update master outputs table
        for (const [key, val] of Object.entries(action.variables)) {
          draft.outputs[key] = val
        }
      })

    case 'variables/input/update':
      return produce(state, draft => {
        draft.inputs[action.name] = action.value
      })

    case 'variables/variable/update':
      return produce(state, draft => {
        draft.variables[action.name] = action.value
      })

    case 'variables/input/delete':
      return produce(state, draft => {
        delete draft.inputs[action.name]
      })

    case 'variables/output/delete':
      return produce(state, draft => {
        delete draft.outputs[action.name]
      })

    case 'variables/variable/delete':
      return produce(state, draft => {
        delete draft.variables[action.name]
      })

    default : return state
  }
}
