import InputAdornment from '@material-ui/core/InputAdornment';
import Select from '@material-ui/core/Select';
import React from 'react';
import MenuItem from '@material-ui/core/MenuItem';
import TextField from '@material-ui/core/TextField';

function decimalPlaces(value, precision) {
  // Determines the number of decimal places a value should have for the
  // desired precision
  value = Math.abs(value).toString()
  if (value == 0) {
    return precision-1
  }
  let digits = precision - Math.floor(Math.log10(value))-1

  return Math.max(0, digits)
}

function precisionOf(n) {
  // Returns the number of significant figures in a number or string.
  n = n.split('e')[0]     // compute precision of mantissa only
  n = n.replace('-', '')
  // special case: if equal to zero, return the number of zeros to avoid
  // overwriting user input
  if (n == 0) {
    n = n.replace('.', '')
    return n.length
  }

  if (!n.includes('.')) {
    n = n.replace(/0+$/, "")   // remove trailing zeros with no decimal point
  }
  n = n.replace(/^0*\.0*/, "")  // remove leading zeros before and after decimal point
  n = n.replace('.', '')  // remove decimal point
  return n.length
}

function scaleString(str, scale) {
  // Multiplies a passed number in string form by a scale factor, maintaining
  // the original precision

  // add a leading zero to decimal numbers for consistency
  if (str.charAt(0) == '.') {
    str = str.replace('.', '0.')
  }
  else if (str.substring(0, 2) == '-.') {
    str = str.replace('-.', '-0.')
  }

  let number = Math.abs(str) * scale

  let places = decimalPlaces(number, precisionOf(str))
  number = number.toFixed(places)
  if (str.charAt(0) == '-') {
    number = '-' + number
  }

  return number
}

function ScaledInput(props) {
  const [scale, setScale] = [props.scale, props.setScale]
  const [displayValue, setDisplayValue] = React.useState((props.value/scale).toString())
  const [hasTrailingDecimal, setTrailingDecimal] = React.useState(props.value.slice(-1) == '.')
  let exceptions = ['', '-', '.', '-.']
  syncDisplayValue()

  function syncDisplayValue() {
    // Because the displayValue is a separate state from props.value, they can
    // desynchronize if props.value is changed from outside this component, e.g.
    // when swapping the order of timesteps. This function checks for this and
    // resynchronizes if necessary.
    if (exceptions.includes(props.value)) {
      if (displayValue != props.value) {
        setDisplayValue(props.value)
      }
      return
    }
    let newValue = scaleString(props.value, 1/scale)
    if (hasTrailingDecimal) {
      newValue += '.'
    }
    if (newValue != displayValue) {
      setDisplayValue(newValue)
    }
  }

  function onChange(value) {
    let newValue = value
    if (!exceptions.includes(value)) {
      newValue = scaleString(value, scale)
    }
    setTrailingDecimal(value.slice(-1) == '.')
    props.onChange(newValue)
    setDisplayValue(value)
    if (0 < Math.abs(value) & Math.abs(value) < 1e-3) {
      alert('Warning: numerical value too small. Choose an appropriate metric prefix.')
    }
  }

  function changeUnits(newScale) {
    if (exceptions.includes(props.value)) {
      setScale(newScale)
      return
    }
    let newValue = scaleString(props.value, newScale/scale)

    props.onChange(newValue)
    setScale(newScale)
  }

  return (
      <TextField onChange = {(event) => onChange(event.target.value)}
             value={displayValue}
             label={(props.label || '')}
             variant={(props.variant) || 'standard'}
             size={(props.size) || 'medium'}
             placeholder={props.placeholder}
             InputLabelProps={{ shrink: true }}
             InputProps={{
               endAdornment: <InputAdornment position="end">
                              <Select disableUnderline value={scale} onChange={(event) => changeUnits(event.target.value)}>
                                {Object.keys(props.units).map(key => (
                                  <MenuItem value={props.units[key]} key={key}>
                                    {key}
                                  </MenuItem>
                                ))}
                              </Select>
                             </InputAdornment>
             }}
      />
  )
}

export default function ScaledInputWrapper(props) {
  if (props.scale == null) {
    const [scale, setScale] = React.useState(1)
    var newProps = {...props, scale, setScale}
    return ScaledInput(newProps)
  }
  return ScaledInput(props)
}
