import InputAdornment from '@material-ui/core/InputAdornment';
import Select from '@material-ui/core/Select';
import React from 'react';
import MenuItem from '@material-ui/core/MenuItem';
import TextField from '@material-ui/core/TextField';

export default function VariableUnitInput(props) {
  let [value, unit] = props.value.split(' ')

  unit = unit || props.units[0]

  return (
      <TextField onChange = {(event) => props.onChange(event.target.value + ' ' + unit)}
             value={value}
             label={(props.label || '')}
             variant={(props.variant) || 'standard'}
             size={(props.size) || 'medium'}
             placeholder={value}
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
