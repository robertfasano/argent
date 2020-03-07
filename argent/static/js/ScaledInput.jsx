import InputAdornment from '@material-ui/core/InputAdornment';
import Select from '@material-ui/core/Select';
import React from 'react';
import MenuItem from '@material-ui/core/MenuItem';
import TextField from '@material-ui/core/TextField';


export default function ScaledInput(props) {
  const [scale, setScale] = React.useState(1)
  const [displayValue, setDisplayValue] = React.useState(props.value)

  React.useEffect(scaleInitialValue, [])

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

    const scale = 10**expof10
    if (scaleFactors.includes(scale)) {
      setScale(10**expof10)
      setDisplayValue(scaledValue)
    }
  }

  function onChange(value, scale_value) {
    if (scale_value == null){
      scale_value = scale
    }
    props.onChange(value*scale_value)      // send scaled value to passed callback
    setDisplayValue(value)                 // display unscaled value
  }

  function changeUnits(scale) {
    setScale(scale)
    onChange(displayValue, scale)
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
