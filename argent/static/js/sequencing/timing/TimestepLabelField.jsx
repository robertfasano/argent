import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import TextField from '@material-ui/core/TextField'
import DebouncedTextField from '../../components/DebouncedTextField.jsx'

function TimestepLabelField (props) {
  // A button which opens a popover allowing timestep durations to be defined or linked to variables
  const disabled = false || props.disabled
  return (
    <DebouncedTextField centered={true} disabled={disabled} value={props.label} onBlur={(value) => props.update('timestep/label', value)} InputProps={{ disableUnderline: true, style: { textAlign: 'center' } }}/>

  )
}

TimestepLabelField.propTypes = {
  timestep: PropTypes.number,
  label: PropTypes.string,
  update: PropTypes.func,
  disabled: PropTypes.bool
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
    label: state.sequences[state.active_sequence].steps[props.timestep].label || ''
  }
}
export default connect(mapStateToProps, mapDispatchToProps)(TimestepLabelField)
