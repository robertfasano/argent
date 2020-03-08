import InputAdornment from '@material-ui/core/InputAdornment';
import Select from '@material-ui/core/Select';
import React from 'react';
import MenuItem from '@material-ui/core/MenuItem';
import TextField from '@material-ui/core/TextField';

function precisionOf(n) {
  // Returns the number of significant figures in a number or string.
  n = n.toString()

  // remove trailing zeros with no decimal point
  if (!n.includes('.')) {
    while (true) {
      let char = n.slice(-1)
      if (char == '0') {
        n = n.substring(0, n.length - 1)
      }
      else {
        break
      }
    }
  }

  // remove leading zeros
  while (true) {
    let char = n.charAt(0)
    if (char == '0' || char == '.') {
      n = n.slice(1)
    }
    else {
      break
    }
  }

  // remove decimal point
  n = n.replace('.', '')

  return n.length
}

function preciseString(number, precision) {
  // Converts a number into a string representation with the desired precision
  return parseFloat(number.toPrecision(precision)).toString()
}

function ScaledInput(props) {
  const [scale, setScale] = [props.scale, props.setScale]
  const [displayValue, setDisplayValue] = React.useState((props.value/scale).toString())

  syncDisplayValue()

  function syncDisplayValue() {
    // Because the displayValue is a separate state from props.value, they can
    // desynchronize if props.value is changed from outside this component. This
    // function checks for this and resynchronizes if necessary.
    if (props.value == '') {
      return
    }
    if (props.value / scale != displayValue) {
      let newValue = preciseString(props.value/scale, precisionOf(props.value))
      setDisplayValue(newValue)
    }
  }
  function scaleInitialValue() {
    // Set the initial unit based on the passed value. Examples:
    //    10 -> 10 V
    //    0.01 -> 10 mV
    //    0.00001 -> 100 uV
    if (props.value == 0) {
      return
    }
    const scaleFactors = Object.values(props.units).sort()
    var expof10 = Math.log10(props.value)

    var sign = 1
    if (expof10 > 0) {
      expof10 = Math.floor(expof10/3)*3
      sign = 0
    }
    else {
      expof10 = Math.floor((-expof10 + 3) / 3) * (-3)
    }
    var scaledValue = props.value / 10**expof10
    if (scaledValue >= 1000.) {
      scaledValue /= 1000.0
      expof10 += 3*sign
    }

    const factor = 10**expof10
    if (scaleFactors.includes(factor)) {
      setScale(factor)
    }
  }

  function onChange(value, scaleValue) {
    if (scaleValue == null){
      scaleValue = scale
    }
    let newValue = preciseString(value*scaleValue, precisionOf(value))
    props.onChange(newValue)
    setDisplayValue(value)

  }

  function changeUnits(newScale) {
    let oldScale = scale
    let newValue = preciseString(props.value*newScale/oldScale, precisionOf(displayValue))
    props.onChange(newValue)
    setScale(newScale)

  }

  return (
      <TextField onChange = {(event) => onChange(event.target.value)}
             value={displayValue}
             label={(props.label || '')}
             variant={(props.variant) || 'standard'}
             size={(props.size) || 'medium'}
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
