import React from 'react'
import PropTypes from 'prop-types'
import InputAdornment from '@material-ui/core/InputAdornment'
import TextField from '@material-ui/core/TextField'

function IntegerUnitInput (props) {
  // A text field displaying a fixed unit and label
  return (
    <TextField onChange = {(event) => props.onChange(event.target.value)}
               onBlur = {() => props.onChange(parseInt(props.value))}
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

IntegerUnitInput.propTypes = {
  onChange: PropTypes.func,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  placeholder: PropTypes.string,
  label: PropTypes.string,
  unit: PropTypes.string,
  style: PropTypes.object
}
export default IntegerUnitInput