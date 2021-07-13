import InputAdornment from '@material-ui/core/InputAdornment'
import Select from '@material-ui/core/Select'
import React from 'react'
import PropTypes from 'prop-types'
import MenuItem from '@material-ui/core/MenuItem'
import TextField from '@material-ui/core/TextField'

function VariableUnitInput (props) {
  // Allows display and setting of unitful strings like '1 V' or '30 us'. The
  // value is set by a TextField, while the unit is set by a Select.
  let [value, unit] = props.value.split(' ')

  unit = unit || props.units[0]

  return (
      <TextField onChange = {(event) => props.onChange(event.target.value + ' ' + unit)}
             value={value}
             label={(props.label || '')}
             variant={(props.variant) || 'standard'}
             size={(props.size) || 'small'}
             placeholder={value}
             style={props.style || {}}
             InputLabelProps={{ shrink: true }}
             InputProps={{
               endAdornment: <InputAdornment position="end">
                              <Select disableUnderline value={unit} onChange={(event) => props.onChange(value + ' ' + event.target.value)}>
                                {props.units.map((key, index) => (
                                  <MenuItem value={key} key={key}>
                                    {key}
                                  </MenuItem>
                                ))}
                              </Select>
                             </InputAdornment>
             }}
      />
  )
}

VariableUnitInput.propTypes = {
  onChange: PropTypes.func,
  value: PropTypes.string,
  label: PropTypes.string,
  variant: PropTypes.string,
  size: PropTypes.string,
  placeholder: PropTypes.string,
  units: PropTypes.array,
  style: PropTypes.object
}
export default VariableUnitInput
