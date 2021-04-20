import React from 'react'
import PropTypes from 'prop-types'
import InputAdornment from '@material-ui/core/InputAdornment'
import TextField from '@material-ui/core/TextField'

function FixedUnitInput (props) {
  // A text field displaying a fixed unit and label
  // const value = props.value.split(' ')[0] || ''
  // let value = ''

  // const value = props.value == '' ? props.value.split(' ')[0] : props.value
  // console.log(props.value, value)

  return (
    <TextField onChange = {(event) => props.onChange(event)}
               value = {props.value}
               placeholder = {props.placeholder}
               size = "small"
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
  value: PropTypes.string,
  placeholder: PropTypes.string,
  label: PropTypes.string,
  unit: PropTypes.string,
  style: PropTypes.object
}
export default FixedUnitInput
