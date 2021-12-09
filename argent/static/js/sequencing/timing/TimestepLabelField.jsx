import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import TextField from '@material-ui/core/TextField'

function TimestepLabelField (props) {
  // A button which opens a popover allowing timestep durations to be defined or linked to variables
  const disabled = false || props.disabled
  if (props.skip) {
    return (
    <del>
    <TextField disabled={disabled} value={props.label} onChange={(event) => props.update('timestep/label', event.target.value)} inputProps={{ style: { textAlign: 'center' } }} InputProps={{ disableUnderline: true, style: { textAlign: 'center' } }}/>
  </del>
    )
  }
  return (
    <TextField disabled={disabled} value={props.label} onChange={(event) => props.update('timestep/label', event.target.value)} inputProps={{ style: { textAlign: 'center' } }} InputProps={{ disableUnderline: true, style: { textAlign: 'center' } }}/>
  )
}

TimestepLabelField.propTypes = {
  timestep: PropTypes.number,
  label: PropTypes.string,
  update: PropTypes.func,
  disabled: PropTypes.bool,
  skip: PropTypes.bool
}

function mapDispatchToProps (dispatch, props) {
  return {
    update: (type, value) => {
      dispatch({ type, value: value, timestep: props.timestep })
    }
  }
}

function mapStateToProps (state, props) {
  return {
    label: state.sequences[state.active_sequence].steps[props.timestep].label || '',
    skip: state.sequences[state.active_sequence].steps[props.timestep].skip || false
  }
}
export default connect(mapStateToProps, mapDispatchToProps)(TimestepLabelField)
