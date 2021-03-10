import React from 'react'
import PropTypes from 'prop-types'
import Radio from '@material-ui/core/Radio'
import RadioGroup from '@material-ui/core/RadioGroup'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import FormControl from '@material-ui/core/FormControl'
import FormLabel from '@material-ui/core/FormLabel'

function ModeSelector (props) {
  // Allows a choice of 'constant' or 'ramp' modes
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

ModeSelector.propTypes = {
  label: PropTypes.string,
  onChange: PropTypes.func,
  value: PropTypes.string
}

export default ModeSelector
