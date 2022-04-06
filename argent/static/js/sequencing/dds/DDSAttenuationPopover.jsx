import React from 'react'
import PropTypes from 'prop-types'
import Popover from '@material-ui/core/Popover'
import Box from '@material-ui/core/Box'
import Typography from '@material-ui/core/Typography'
import { connect, shallowEqual } from 'react-redux'
import ModeSelector from '../ModeSelector.jsx'
import LinkableParameter from '../../components/LinkableParameter.jsx'
import { createSelector } from 'reselect'
import { selectPresentState, selectTimestep, selectVariableValues } from '../../selectors.js'
import LinearRamp from '../LinearRamp.jsx'

function DDSAttenuationPopover (props) {
  return (
    <Popover
      open={Boolean(props.state.anchor)}
      anchorEl={props.state.anchor}
      onClose={props.close}
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'right'
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'left'
      }}
      disableRestoreFocus={true}
    >
    { props.state.anchor === null
      ? null
      : <Box p={1}>
      <Typography style={{ fontWeight: 'bold', fontSize: 24 }}>
          DDS attenuation
      </Typography>
      <ModeSelector label={'Attenuation mode'}
                    value={props.channel.attenuation.mode}
                    onChange = {(event) => props.update('dds/attenuation/mode', event.target.value)}
                    ramp={false}
      />
      {(props.channel.attenuation.mode === 'setpoint')
        ? <LinkableParameter value={props.channel.attenuation.setpoint} onChange={(value) => props.update('dds/attenuation/setpoint', value)} label='Attenuation' unit='dB'/>
        : null
      }

      {props.channel.attenuation.mode === 'ramp'
        ? <LinearRamp prefix='dds/attenuation' ramp={props.channel.attenuation.ramp} update={props.update} unit='MHz'/>
        : null}

    </Box>
  }

    </Popover>
  )
}

DDSAttenuationPopover.propTypes = {
  toggleSwitch: PropTypes.func,
  variables: PropTypes.object,
  update: PropTypes.func,
  anchorEl: PropTypes.object,
  setAnchorEl: PropTypes.func,
  channel: PropTypes.object
}

function mapDispatchToProps (dispatch, props) {
  const path = {
    ch: props.state.channel,
    timestep: props.state.timestep
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
  // state => state.variables,
  state => selectVariableValues(state),
  (variables) => Object.assign({}, variables),
  { memoizeOptions: { resultEqualityCheck: shallowEqual } }
)

function mapStateToProps (state, props) {
  state = selectPresentState(state)
  const channel = props.state.anchor === null ? null : selectTimestep(state, props.state.timestep).dds[props.state.channel]
  return {
    open: Boolean(props.state.anchor),
    variables: selectVariables(state),
    channel: channel

  }
}

export default connect(mapStateToProps, mapDispatchToProps)(DDSAttenuationPopover)
