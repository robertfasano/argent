import React from 'react';
import InputAdornment from '@material-ui/core/InputAdornment';
import TextField from '@material-ui/core/TextField';

export default function FixedUnitInput(props) {
  // A text field displaying a fixed unit and label
  return (
    <TextField onChange = {(event) => props.onChange(event)}
               value = {props.value}
               placeholder = {props.placeholder}
               variant = "outlined"
               size = "small"
               label={props.label}
               InputLabelProps={{ shrink: true }}
               InputProps={{
                 endAdornment: <InputAdornment position="end">
                                {props.unit}
                               </InputAdornment>
               }}
    />
  )
}
