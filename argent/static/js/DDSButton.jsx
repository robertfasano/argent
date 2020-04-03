import React from 'react';
import Button from '@material-ui/core/Button';
import Popover from '@material-ui/core/Popover';
import TableCell from '@material-ui/core/TableCell';
import Grid from '@material-ui/core/Grid'
import Box from '@material-ui/core/Box'
import Switch from '@material-ui/core/Switch';
import ScaledInput from './ScaledInput.jsx'
import FixedUnitInput from './FixedUnitInput.jsx'
import ModeSelector from './ModeSelector.jsx'
import {connect} from 'react-redux'
import {gradient} from './colors.js'
import { createSelector } from 'reselect'

function getColor(value) {
  if (value == "") {
    return '#004e67'
  }
  return gradient('#004e67', "#D3D3D3", 0, 31.5, value)
}

function DDSButton(props) {
  const [anchorEl, setAnchorEl] = React.useState(null)
  const open = Boolean(anchorEl);
  function getImplicitFrequencyValues() {
    let implicitSetpoint = props.frequency.setpoint
    let i = props.timestep-1
    while (i >= 0 & implicitSetpoint == '') {
      let state = props.sequence[i].frequency
      implicitSetpoint = state.mode == 'constant'? state.setpoint : state.stop
      i -= 1
    }

    let implicitStart = props.frequency.start
    i = props.timestep-1
    while (i >= 0 & implicitStart == '') {
      let state = props.sequence[i].frequency
      implicitStart = state.mode == 'constant'? state.setpoint : state.stop
      i -= 1
    }

    let implicitStop = props.frequency.stop == ''? implicitStart: props.frequency.stop

    return {setpoint: implicitSetpoint, start: implicitStart, stop: implicitStop}
  }
  let implicitFrequency = getImplicitFrequencyValues()

  function getImplicitAttenuationValues() {
    let implicitSetpoint = props.attenuation.setpoint
    let i = props.timestep-1
    while (i >= 0 & implicitSetpoint == '') {
      let state = props.sequence[i].attenuation
      implicitSetpoint = state.mode == 'constant'? state.setpoint : state.stop
      i -= 1
    }

    let implicitStart = props.attenuation.start
    i = props.timestep-1
    while (i >= 0 & implicitStart == '') {
      let state = props.sequence[i].attenuation
      implicitStart = state.mode == 'constant'? state.setpoint : state.stop
      i -= 1
    }

    let implicitStop = props.attenuation.stop == ''? implicitStart: props.attenuation.stop

    return {setpoint: implicitSetpoint, start: implicitStart, stop: implicitStop}
  }
  let implicitAttenuation = getImplicitAttenuationValues()

  let color = "#D3D3D3"
  if (props.on) {
    color = getColor(implicitAttenuation.setpoint)
  }
  let constantStyle = {background: `linear-gradient(90deg, ${color} 0%, ${color} 100%)`}  // changing gradient to uniform color is faster than setting backgroundColor
  let ramp = `linear-gradient(90deg, ${getColor(implicitAttenuation.start)} 0%, ${getColor(implicitAttenuation.stop)} 100%)`
  let rampStyle = props.on? {background: ramp}: constantStyle
  let style = props.attenuation.mode=='constant'? constantStyle: rampStyle


  function dispatch(type, value) {
    props.dispatch({type: type,
                    timestep: props.timestep,
                    channel: props.channel,
                    value: value})
  }

  function updateSwitch(event) {
    props.dispatch({type: 'dds/toggle',
                    timestep: props.timestep,
                    channel: props.channel})
  }

  return (
    <TableCell component="th" scope="row" key={props.timestep}>
      <Button variant="contained"
              disableRipple={true}
              style={style}
              onClick={(event) => setAnchorEl(event.currentTarget)}
              >
        {''}
      </Button>
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
      >
        <Box m={1}>
          <Switch checked={props.on} onChange={updateSwitch}/>
        </Box>
        <Box m={1}>
          <ModeSelector label={"Frequency"}
                        value={props.frequency.mode}
                        onChange = {(event) => dispatch('dds/frequency/mode', event.target.value)}

          />
        </Box>
        {props.frequency.mode=='constant'? (
          <Box m={1}>
            <ScaledInput value={props.frequency.setpoint}
                         placeholder={implicitFrequency.setpoint}
                           onChange = {(value) => dispatch('dds/frequency/setpoint', value)}
                           units = {{'Hz': 1, 'kHz': 1e3, 'MHz': 1e6}}
                           label = 'Setpoint'
                           variant = 'outlined'
                           size = 'small'
            />
          </Box>
        ): null}
        {props.frequency.mode=='ramp'? (
          <React.Fragment>
          <Box m={1}>
            <ScaledInput value={props.frequency.start}
                           placeholder={implicitFrequency.start}
                           onChange = {(value) => dispatch('dds/frequency/start', value)}
                           units = {{'Hz': 1, 'kHz': 1e3, 'MHz': 1e6}}
                           label = 'Start'
                           variant = 'outlined'
            />
          </Box>
          <Box m={1}>
            <ScaledInput value={props.frequency.stop}
                         placeholder={implicitFrequency.stop}
                           onChange = {(value) => dispatch('dds/frequency/stop', value)}
                           units = {{'Hz': 1, 'kHz': 1e3, 'MHz': 1e6}}
                           label = 'Stop'
                           variant = 'outlined'
            />
          </Box>
          </React.Fragment>
        ):
        null}
        <Box m={1}>
          <ModeSelector label={"Attenuation"}
                        value={props.attenuation.mode}
                        onChange = {(event) => dispatch('dds/attenuation/mode', event.target.value)}
          />
        </Box>
        {props.attenuation.mode=='constant'? (
          <Box m={1}>
            <FixedUnitInput value={props.attenuation.setpoint}
                            placeholder={implicitAttenuation.setpoint}
                            onChange = {(event) => dispatch('dds/attenuation/setpoint', event.target.value)}
                            label = 'Setpoint'
                            unit = 'dB'
            />
          </Box>
        ): null}
        {props.attenuation.mode=='ramp'? (
          <React.Fragment>
          <Box m={1}>
            <FixedUnitInput value={props.attenuation.start}
                            placeholder={implicitAttenuation.start}
                            onChange = {(event) => dispatch('dds/attenuation/start', event.target.value)}
                            label = 'Start'
                            unit = 'dB'
            />
          </Box>
          <Box m={1}>
            <FixedUnitInput value={props.attenuation.stop}
                            placeholder={implicitAttenuation.stop}
                            onChange = {(event) => dispatch('dds/attenuation/stop', event.target.value)}
                            label = 'Stop'
                            unit = 'dB'
            />
          </Box>
          </React.Fragment>
        ):
        null}

      </Popover>
    </TableCell>
)}


function mapStateToProps(state, ownProps){
  let dict = state['sequence']['dds'][ownProps.channel][ownProps.timestep]
  return {frequency: dict.frequency,
          attenuation: dict.attenuation,
          on: dict.on,
          sequence: state['sequence']['dds'][ownProps.channel]
        }
}

export default connect(mapStateToProps)(DDSButton)
