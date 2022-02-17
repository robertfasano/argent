import { createSelector } from 'reselect'
import { shallowEqual } from 'react-redux'

export const selectActiveSequence = (state) => state.sequences[state.active_sequence]
export const selectTimestep = (state, index) => state.sequences[state.active_sequence].steps[index]
export const selectSequenceLength = (state) => state.sequences[state.active_sequence].steps.length
export const selectPresentState = (state) => state.present

export const selectVariableValues = createSelector(
  state => state.variables,
  (variables) => {
    const vars = {}
    for (const key of Object.keys(variables)) {
      vars[key] = variables[key].value
    }
    return vars
  },
  { memoizeOptions: { resultEqualityCheck: shallowEqual } }
)

export const selectVariableGroups = createSelector(
  state => state.variables,

  (variables) => {
    const groups = { default: [] }
    for (const name of Object.keys(variables)) {
      const group = variables[name].group || 'default'
      if (Object.keys(groups).includes(group)) groups[group].push(name)
      else groups[group] = [name]
    }
    return groups
  },
  { memoizeOptions: { resultEqualityCheck: shallowEqual } }
)

// export const selectVariableGroups = (state) => {
//   const groups = { default: [] }
//   for (const name of Object.keys(state.variables)) {
//     const group = state.variables[name].group || 'default'
//     if (Object.keys(groups).includes(group)) groups[group].push(name)
//     else groups[group] = [name]
//   }
//   return groups
// }
