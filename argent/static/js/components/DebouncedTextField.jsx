import React from 'react'
import PropTypes from 'prop-types'
import TextField from '@material-ui/core/TextField'

function toDecimalString (num) {
  if (!num.includes('.')) {
    return num + '.0'
  }
  return num
}

function DebouncedTextField (props) {
  const [text, setText] = React.useState(props.value)

  function onBlur (value) {
    const newText = toDecimalString(value)
    props.onBlur(newText)
    setText(newText)
  }

  return (
    <TextField value={text} onChange={(event) => setText(event.target.value)} onBlur={(event) => onBlur(event.target.value)} />
  )
}

DebouncedTextField.propTypes = {
  onBlur: PropTypes.func,
  value: PropTypes.oneOfType([PropTypes.string])
}

export default DebouncedTextField
