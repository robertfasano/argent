export const selectActiveSequence = (state) => state.sequences[state.active_sequence]
export const selectTimestep = (state, index) => state.sequences[state.active_sequence].steps[index]
export const selectSequenceLength = (state) => state.sequences[state.active_sequence].steps.length
