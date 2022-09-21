import React from 'react'
import PropTypes from 'prop-types'
import Box from '@material-ui/core/Box'
import LinkableParameter from '../components/LinkableParameter'
import FixedUnitInput from '../components/FixedUnitInput'

function Ramp (props) {
  return (
    <>
      <LinkableParameter value={props.ramp.start} onChange={(value) => props.update(props.prefix + '/ramp/start', value)} label='Start' unit={props.unit}/>
      <LinkableParameter value={props.ramp.stop} onChange={(value) => props.update(props.prefix + '/ramp/stop', value)} label='Stop' unit={props.unit}/>
      <Box mx={1}>
        <FixedUnitInput value={props.ramp.steps}
                          onChange = {(value) => props.update(props.prefix + '/ramp/steps', value)}
                          unit = {''}
                          label={'Steps'}
                          style={{ width: '250px' }}
                          integer
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
