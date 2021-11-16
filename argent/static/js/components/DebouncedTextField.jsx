import React from 'react'
import PropTypes from 'prop-types'
import TextField from '@material-ui/core/TextField'

function toDecimalString (num) {
  if (!num.includes('.')) {
    return num + '.0'
  }
  return num
}

function isNumeric (str) {
  // from https://stackoverflow.com/questions/175739
  if (typeof str !== 'string') return false // we only process strings!
  return !isNaN(str) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
         !isNaN(parseFloat(str)) // ...and ensure strings of whitespace fail
}

function DebouncedTextField (props) {
  const [text, setText] = React.useState(props.value)

  function onBlur (value) {
    let newText = value
    if (isNumeric(String(newText))) {
      newText = toDecimalString(newText)
    }
    // const newText = toDecimalString(value)
    props.onBlur(newText)
    setText(newText)
  }

  const InputProps = props.InputProps || {}
  const disabled = false || props.disabled
  const inputProps = props.centered ? { style: { textAlign: 'center' } } : {}

  return (
    <TextField disabled={disabled} value={text} onChange={(event) => setText(event.target.value)} onBlur={(event) => onBlur(event.target.value)} inputProps={inputProps} InputProps={InputProps}/>
  )
}

DebouncedTextField.propTypes = {
  onBlur: PropTypes.func,
  value: PropTypes.oneOfType([PropTypes.string]),
  InputProps: PropTypes.object,
  disabled: PropTypes.bool,
  centered: PropTypes.bool
}

export default DebouncedTextField
