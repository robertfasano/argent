import React from 'react'
import PropTypes from 'prop-types'
import Popover from '@material-ui/core/Popover'
import Box from '@material-ui/core/Box'
import Typography from '@material-ui/core/Typography'
import TextField from '@material-ui/core/TextField'
import ModeSelector from '../ModeSelector.jsx'
import { connect, shallowEqual } from 'react-redux'
import LinkableParameter from '../../components/LinkableParameter.jsx'
import { createSelector } from 'reselect'
import { selectTimestep, selectPresentState } from '../../selectors.js'

function DACPopover (props) {
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
            DAC options
        </Typography>

        <ModeSelector label={'Setpoint mode'}
                      value={props.mode}
                      onChange = {(event) => props.update('dac/mode', event.target.value)}
                      ramp={true}
        />

        {(props.mode === 'setpoint')
          ? <LinkableParameter value={props.setpoint} onChange={(value) => props.update('dac/setpoint', value)} label='Setpoint' unit='V'/>
          : null
        }

        {props.mode === 'ramp'
          ? (
            <>
              <LinkableParameter value={props.ramp.start} onChange={(value) => props.update('dac/ramp/start', value)} label='Start' unit='V'/>
              <LinkableParameter value={props.ramp.stop} onChange={(value) => props.update('dac/ramp/stop', value)} label='Stop' unit='V'/>
              <Box mx={1}>
                <TextField label='Steps'
                          value={props.ramp.steps}
                          onChange={(event) => props.update('dac/ramp/steps', event.target.value)}
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

DACPopover.propTypes = {
  ch: PropTypes.string,
  board: PropTypes.string,
  timestep: PropTypes.number,
  setpoint: PropTypes.string,
  ramp: PropTypes.object,
  mode: PropTypes.string,
  variables: PropTypes.object,
  update: PropTypes.func,
  anchorPosition: PropTypes.array,
  open: PropTypes.bool,
  setOpen: PropTypes.func
}

function mapDispatchToProps (dispatch, props) {
  const path = {
    ch: props.ch,
    timestep: props.timestep,
    board: props.board
  }

  return {
    update: (type, value) => dispatch({ type, value, path })
  }
}

const selectVariables = createSelector(
  state => state.variables,
  state => state.parameters,
  (variables, parameters) => Object.assign({}, variables, parameters),
  { memoizeOptions: { resultEqualityCheck: shallowEqual } }
)

function mapStateToProps (state, props) {
  state = selectPresentState(state)
  const channel = selectTimestep(state, props.timestep).dac[props.board][props.ch]
  const ramp = channel.ramp
  const mode = channel.mode
  return {
    mode: mode,
    setpoint: channel.setpoint,
    ramp: ramp,
    variables: selectVariables(state)
  }
}
export default connect(mapStateToProps, mapDispatchToProps)(DACPopover)
