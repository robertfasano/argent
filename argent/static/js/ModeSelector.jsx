import React from 'react';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormControl from '@material-ui/core/FormControl';
import FormLabel from '@material-ui/core/FormLabel';

export default function ModeSelector(props) {
  return (
    <FormControl component="fieldset">
      <FormLabel component="legend">{props.label}</FormLabel>
      <RadioGroup row value={props.value} onChange={props.onChange}>
        <FormControlLabel value="constant" control={<Radio />} label="Constant" />
        <FormControlLabel value="ramp" control={<Radio />} label="Ramp" />
      </RadioGroup>
    </FormControl>
  )
}
