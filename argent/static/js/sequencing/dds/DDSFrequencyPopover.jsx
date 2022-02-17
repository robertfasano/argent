import React from 'react'
import PropTypes from 'prop-types'
import Popover from '@material-ui/core/Popover'
import Box from '@material-ui/core/Box'
import Typography from '@material-ui/core/Typography'
import { connect, shallowEqual } from 'react-redux'
import ModeSelector from '../ModeSelector.jsx'
import LinkableParameter from '../../components/LinkableParameter.jsx'
import { createSelector } from 'reselect'
import { selectTimestep, selectPresentState, selectVariableValues } from '../../selectors.js'
import LinearRamp from '../LinearRamp.jsx'

function DDSFrequencyPopover (props) {
  return (
    <Popover
        anchorReference="anchorPosition"
        open={props.open}
        anchorPosition={{ top: props.anchorPosition[1], left: props.anchorPosition[0] }}
        onClose={(event) => props.setOpen(false)}
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
              DDS options
          </Typography>
          <ModeSelector label={'Frequency mode'}
                        value={props.frequency.mode}
                        onChange = {(event) => props.update('dds/frequency/mode', event.target.value)}
                        ramp={true}
          />
          {(props.frequency.mode === 'setpoint')
            ? <LinkableParameter value={props.frequency.setpoint} onChange={(value) => props.update('dds/frequency/setpoint', value)} label='Frequency' unit='MHz'/>
            : null
          }

          {props.frequency.mode === 'ramp'
            ? <LinearRamp prefix='dds/frequency' ramp={props.frequency.ramp} update={props.update} unit='MHz'/>
            : null}
        </Box>
      </Popover>
  )
}

DDSFrequencyPopover.propTypes = {
  enable: PropTypes.bool,
  frequency: PropTypes.object,
  toggleSwitch: PropTypes.func,
  variables: PropTypes.object,
  update: PropTypes.func,
  anchorPosition: PropTypes.array,
  open: PropTypes.bool,
  setOpen: PropTypes.func
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
  // state => state.variables,
  state => selectVariableValues(state),
  (variables) => Object.assign({}, variables),
  { memoizeOptions: { resultEqualityCheck: shallowEqual } }
)

function mapStateToProps (state, props) {
  state = selectPresentState(state)
  const channel = selectTimestep(state, props.timestep).dds[props.ch]

  return {
    enable: channel.enable,
    frequency: channel.frequency,
    variables: selectVariables(state)

  }
}

export default connect(mapStateToProps, mapDispatchToProps)(DDSFrequencyPopover)
