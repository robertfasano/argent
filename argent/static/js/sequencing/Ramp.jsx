import React from 'react'
import PropTypes from 'prop-types'
import Box from '@material-ui/core/Box'
import TextField from '@material-ui/core/TextField'
import LinkableParameter from '../components/LinkableParameter'

function Ramp (props) {
  return (
    <>
      <LinkableParameter value={props.ramp.start} onChange={(value) => props.update(props.prefix + '/ramp/start', value)} label='Start' unit={props.unit}/>
      <LinkableParameter value={props.ramp.stop} onChange={(value) => props.update(props.prefix + '/ramp/stop', value)} label='Stop' unit={props.unit}/>
      <Box mx={1}>
        <TextField label='Steps'
                  value={props.ramp.steps}
                  onChange={(event) => props.update(props.prefix + '/ramp/steps', event.target.value)}
                  InputLabelProps={{ shrink: true }}
        />
      </Box>
    </>
    )
}

Ramp.propTypes = {
  ramp: PropTypes.object,
  update: PropTypes.func,
  prefix: PropTypes.string,
  unit: PropTypes.string
}

export default Ramp
