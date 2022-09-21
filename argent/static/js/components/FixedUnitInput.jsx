import React from 'react'
import PropTypes from 'prop-types'
import InputAdornment from '@material-ui/core/InputAdornment'
import TextField from '@material-ui/core/TextField'

function FixedUnitInput (props) {
  // A text field displaying a fixed unit and label
  const [text, setText] = React.useState(props.value)

  React.useEffect(() => {
    setText(props.value)
  }, [props.value])
  
  function toDecimalString (num) {
    num = String(num)
    if (props.integer) return num
    if (num == '') return num
    if (!num.includes('.')) {
      return num + '.0'
    }
    return num
  }

  return (
    <TextField onChange = {(event) => setText(event.target.value)}
               onBlur = {() => props.onChange(toDecimalString(text))}
               value = {text}
               placeholder = {props.placeholder}
               size = "medium"
               label={props.label}
               InputLabelProps={{ shrink: true }}
               style={props.style || {}}
               disabled={props.disabled}
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
  style: PropTypes.object,
  integer: PropTypes.bool,
  disabled: PropTypes.bool
}
export default FixedUnitInput
