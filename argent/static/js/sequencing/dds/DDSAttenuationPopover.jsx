import React from 'react'
import PropTypes from 'prop-types'
import Popover from '@material-ui/core/Popover'
import Box from '@material-ui/core/Box'
import Typography from '@material-ui/core/Typography'
import { connect, shallowEqual } from 'react-redux'
import ModeSelector from '../ModeSelector.jsx'
import LinkableParameter from '../../components/LinkableParameter.jsx'
import TextField from '@material-ui/core/TextField'
import { createSelector } from 'reselect'
import { selectTimestep } from '../../selectors.js'

function DDSAttenuationPopover (props) {
  return (
    <Popover
      open={Boolean(props.anchorEl)}
      anchorEl={props.anchorEl}
      onClose={(event) => props.setAnchorEl(null)}
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'right'
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'left'
      }}
    >
      <Box p={1}>
        <Typography style={{ fontWeight: 'bold', fontSize: 24 }}>
            DDS attenuation
        </Typography>
        <ModeSelector label={'Attenuation mode'}
                      value={props.attenuation.mode}
                      onChange = {(event) => props.update('dds/attenuation/mode', event.target.value)}
                      ramp={false}
        />
        {(props.attenuation.mode === 'setpoint')
          ? <LinkableParameter value={props.attenuation.setpoint} onChange={(value) => props.update('dds/attenuation/setpoint', value)} label='Attenuation' unit='dB'/>
          : null
        }

        {props.attenuation.mode === 'ramp'
          ? (
            <>
              <LinkableParameter value={props.attenuation.ramp.start} onChange={(value) => props.update('dds/attenuation/ramp/start', value)} label='Start' unit='dB'/>
              <LinkableParameter value={props.attenuation.ramp.stop} onChange={(value) => props.update('dds/attenuation/ramp/stop', value)} label='Stop' unit='dB'/>
              <Box mx={1}>
                <TextField label='Steps'
                          value={props.attenuation.ramp.steps}
                          onChange={(event) => props.update('dds/attenuation/ramp/steps', event.target.value)}
                          InputLabelProps={{ shrink: true }}
                />
              </Box>
            </>
            )
          : null}

      </Box>
    </Popover>
  )
}

DDSAttenuationPopover.propTypes = {
  enable: PropTypes.bool,
  attenuation: PropTypes.object,
  toggleSwitch: PropTypes.func,
  variables: PropTypes.object,
  update: PropTypes.func,
  anchorEl: PropTypes.object,
  setAnchorEl: PropTypes.func
}

function mapDispatchToProps (dispatch, props) {
  const path = {
    ch: props.ch,
    timestep: props.timestep
  }

  return {
    update: (type, value) => dispatch({ type, value, path }),

    toggleSwitch: () => dispatch({
      type: 'dds/toggle',
      path: path
    })

  }
}

const selectVariables = createSelector(
  state => state.variables,
  state => state.parameters,
  (variables, parameters) => Object.assign({}, variables, parameters),
  { memoizeOptions: { resultEqualityCheck: shallowEqual } }
)

function mapStateToProps (state, props) {
  state = state.present
  const channel = selectTimestep(state, props.timestep).dds[props.ch]

  return {
    enable: channel.enable,
    attenuation: channel.attenuation,
    variables: selectVariables(state)

  }
}

export default connect(mapStateToProps, mapDispatchToProps)(DDSAttenuationPopover)
