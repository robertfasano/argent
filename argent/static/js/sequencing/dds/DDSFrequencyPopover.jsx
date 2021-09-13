import React from 'react'
import PropTypes from 'prop-types'
import Popover from '@material-ui/core/Popover'
import Box from '@material-ui/core/Box'
import Typography from '@material-ui/core/Typography'
import { connect } from 'react-redux'
import ModeSelector from '../ModeSelector.jsx'
import LinkableParameter from '../../components/LinkableParameter.jsx'
import TextField from '@material-ui/core/TextField'

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
            ? <LinkableParameter value={props.frequency.setpoint} inputs={props.inputs} onChange={(value) => props.update('dds/frequency/setpoint', value)} label='Frequency' unit='MHz'/>
            : null
          }

          {props.frequency.mode === 'ramp'
            ? (
              <>
                <LinkableParameter value={props.frequency.ramp.start} inputs={props.inputs} onChange={(value) => props.update('dds/frequency/ramp/start', value)} label='Start' unit='MHz'/>
                <LinkableParameter value={props.frequency.ramp.stop} inputs={props.inputs} onChange={(value) => props.update('dds/frequency/ramp/stop', value)} label='Stop' unit='MHz'/>
                <Box mx={1}>
                  <TextField label='Steps'
                            value={props.frequency.ramp.steps}
                            onChange={(event) => props.update('dds/frequency/ramp/steps', event.target.value)}
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

DDSFrequencyPopover.propTypes = {
  enable: PropTypes.bool,
  frequency: PropTypes.object,
  toggleSwitch: PropTypes.func,
  inputs: PropTypes.object,
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

function mapStateToProps (state, props) {
  const channel = state.sequences[state.active_sequence].steps[props.timestep].dds[props.ch]

  return {
    enable: channel.enable,
    frequency: channel.frequency,
    inputs: state.inputs
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(DDSFrequencyPopover)