export const selectActiveSequence = (state) => state.sequences[state.active_sequence]
export const selectTimestep = (state, index) => state.sequences[state.active_sequence].steps[index]
export const selectSequenceLength = (state) => state.sequences[state.active_sequence].steps.length
export const selectPresentState = (state) => state.present
export const selectVariableValues = (state) => {
  const vars = {}
  for (const key of Object.keys(state.variables)) {
    vars[key] = state.variables[key].value
  }
  return vars
}
export const selectVariableGroups = (state) => {
  const groups = { default: [] }
  for (const name of Object.keys(state.variables)) {
    const group = state.variables[name].group || 'default'
    if (Object.keys(groups).includes(group)) groups[group].push(name)
    else groups[group] = [name]
  }
  return groups
}
