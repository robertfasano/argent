import React from 'react'
import PropTypes from 'prop-types'
import InputAdornment from '@material-ui/core/InputAdornment'
import TextField from '@material-ui/core/TextField'

function FixedUnitInput (props) {
  // A text field displaying a fixed unit and label
  let [value, unit] = props.value.split(' ')

  return (
    <TextField onChange = {(event) => props.onChange(event)}
               value = {value}
               placeholder = {props.placeholder}
               variant = "outlined"
               size = "small"
               label={props.label}
               InputLabelProps={{ shrink: true }}
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
  value: PropTypes.string,
  placeholder: PropTypes.string,
  label: PropTypes.string,
  unit: PropTypes.string
}
export default FixedUnitInput
