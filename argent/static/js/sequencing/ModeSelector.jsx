import React from 'react'
import PropTypes from 'prop-types'
import Radio from '@material-ui/core/Radio'
import RadioGroup from '@material-ui/core/RadioGroup'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import FormControl from '@material-ui/core/FormControl'
import FormLabel from '@material-ui/core/FormLabel'
import Box from '@material-ui/core/Box'

function ModeSelector (props) {
  // Allows a choice of 'setpoint' or 'ramp' modes
  return (
    <Box m={1}>
      <FormControl component="fieldset">
        <FormLabel component="legend">{props.label}</FormLabel>
        <RadioGroup row value={props.value} onChange={props.onChange}>
          <FormControlLabel value="setpoint" control={<Radio />} label="Constant" />
          <FormControlLabel value="ramp" disabled={!props.ramp} control={<Radio />} label="Ramp" />
          <FormControlLabel value="spline" disabled={!props.spline} control={<Radio />} label="Quadratic" />

        </RadioGroup>
      </FormControl>
    </Box>
  )
}

ModeSelector.propTypes = {
  label: PropTypes.string,
  onChange: PropTypes.func,
  value: PropTypes.string,
  ramp: PropTypes.bool
}

export default ModeSelector
