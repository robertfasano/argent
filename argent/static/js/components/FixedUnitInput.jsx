import React from 'react'
import PropTypes from 'prop-types'
import InputAdornment from '@material-ui/core/InputAdornment'
import TextField from '@material-ui/core/TextField'

function FixedUnitInput (props) {
  // A text field displaying a fixed unit and label
  function toDecimalString (num) {
    if (!num.includes('.')) {
      return num + '.0'
    }
    return num
  }

  return (
    <TextField onChange = {(event) => props.onChange(event.target.value)}
               onBlur = {() => props.onChange(toDecimalString(props.value))}
               value = {props.value}
               placeholder = {props.placeholder}
               size = "medium"
               label={props.label}
               InputLabelProps={{ shrink: true }}
               style={props.style || {}}
               InputProps={{
                 endAdornment: <InputAdornment position="end">
                                {props.unit}
                               </InputAdornment>
               }}
    />
  )
}

FixedUnitInput.propTypes = {
  onChange: PropTypes.func,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  placeholder: PropTypes.string,
  label: PropTypes.string,
  unit: PropTypes.string,
  style: PropTypes.object
}
export default FixedUnitInput
