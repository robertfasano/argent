import React from 'react';
import Button from '@material-ui/core/Button';
import Popover from '@material-ui/core/Popover';
import TableCell from '@material-ui/core/TableCell';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import Grid from '@material-ui/core/Grid'
import Box from '@material-ui/core/Box'
import InputAdornment from '@material-ui/core/InputAdornment'
import Switch from '@material-ui/core/Switch';
import ScaledInput from './ScaledInput.jsx'
import FixedUnitInput from './FixedUnitInput.jsx'
import ModeSelector from './ModeSelector.jsx'
import {connect} from 'react-redux'
import {actions} from './reducers/reducer.js'
import {gradient} from './colors.js'


function getColor(value) {
  if (value == "") {
    return "#D3D3D3"
  }
  return gradient('#004e67', "#D3D3D3", 0, 31.5, value)
}

function DDSButton(props) {
  const [anchorEl, setAnchorEl] = React.useState(null)

  let color = "#D3D3D3"
  if (props.on) {
    color = getColor(props.attenuation)
  }
  let constantStyle = {backgroundColor: `linear-gradient(90deg, ${color} 0%, ${color} 100%)`}  // changing gradient to uniform color is faster than setting backgroundColor
  let ramp = `linear-gradient(90deg, ${getColor(props.attenuation_start)} 0%, ${getColor(props.attenuation_stop)} 100%)`
  let rampStyle = props.on? {background: ramp}: constantStyle

  const handleClick = event => {
    setAnchorEl(event.currentTarget)
  }
  const handleClose = () => {
    setAnchorEl(null)
  }
  const open = Boolean(anchorEl);

  function updateFrequency(value) {
    props.dispatch(actions.dds.frequency.update(props.timestep, props.channel, value))
  }

  function updateAttenuation(value) {
    props.dispatch(actions.dds.attenuation.update(props.timestep, props.channel, value))
  }

  const handleFrequencyMode = event => {
    props.dispatch(actions.dds.frequency.setMode(props.timestep, props.channel, event.target.value))
  };

  const handleAttenuationMode = event => {
    props.dispatch(actions.dds.attenuation.setMode(props.timestep, props.channel, event.target.value))
  };

  function updateSwitch(event) {
    props.dispatch(actions.dds.toggle(props.timestep, props.channel))
  }

  function updateFrequencyStart(value) {
    props.dispatch(actions.dds.frequency.updateStart(props.timestep, props.channel, value))
  }
  function updateFrequencyStop(value) {
    props.dispatch(actions.dds.frequency.updateStop(props.timestep, props.channel, value))
  }

  function updateAttenuationStart(value) {
    props.dispatch(actions.dds.attenuation.updateStart(props.timestep, props.channel, value))
  }
  function updateAttenuationStop(value) {
    props.dispatch(actions.dds.attenuation.updateStop(props.timestep, props.channel, value))
  }

  return (
    <TableCell component="th" scope="row" key={props.timestep}>
      <Button variant="contained"
              disableRipple={true}
              style={props.attenuation_mode=='constant'? constantStyle: rampStyle}
              onClick={(event) => handleClick(event)}
              >
        {''}
      </Button>
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
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
                      value={props.frequency_mode}
                      onChange={handleFrequencyMode}
        />
      </Box>
      {props.frequency_mode=='constant'? (
        <Box m={1}>
          <ScaledInput value={props.frequency}
                         onChange = {updateFrequency}
                         units = {{'Hz': 1, 'kHz': 1e3, 'MHz': 1e6}}
                         label = 'Setpoint'
                         variant = 'outlined'
                         size = 'small'
          />
        </Box>
      ): null}
      {props.frequency_mode=='ramp'? (
        <React.Fragment>
        <Box m={1}>
          <ScaledInput value={props.frequency_start}
                         onChange = {updateFrequencyStart}
                         units = {{'Hz': 1, 'kHz': 1e3, 'MHz': 1e6}}
                         label = 'Start'
                         variant = 'outlined'
          />
        </Box>
        <Box m={1}>
          <ScaledInput value={props.frequency_stop}
                         onChange = {updateFrequencyStop}
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
                      value={props.attenuation_mode}
                      onChange={handleAttenuationMode}
        />
      </Box>
      {props.attenuation_mode=='constant'? (
        <Box m={1}>
          <FixedUnitInput value={props.attenuation}
                          onChange = {(event) => updateAttenuation(event.target.value)}
                          label = 'Setpoint'
                          unit = 'dB'
          />
        </Box>
      ): null}
      {props.attenuation_mode=='ramp'? (
        <React.Fragment>
        <Box m={1}>
          <FixedUnitInput value={props.attenuation_start}
                          onChange = {(event) => updateAttenuationStart(event.target.value)}
                          label = 'Start'
                          unit = 'dB'
          />
        </Box>
        <Box m={1}>
          <FixedUnitInput value={props.attenuation_stop}
                          onChange = {(event) => updateAttenuationStop(event.target.value)}
                          label = 'Stop'
                          unit = 'dB'
          />
        </Box>
        </React.Fragment>
      ):
      null}

      </Popover>
    </TableCell>
)
}

function mapStateToProps(state, ownProps){
  let dict = state['sequence'][ownProps.timestep]['dds'][ownProps.channel]
  return {frequency: dict.frequency.setpoint,
          frequency_start: dict.frequency.start,
          frequency_stop: dict.frequency.stop,
          attenuation: dict.attenuation.setpoint,
          attenuation_start: dict.attenuation.start,
          attenuation_stop: dict.attenuation.stop,
          on: dict.on,
          frequency_mode: dict.frequency.mode,
          attenuation_mode: dict.attenuation.mode
        }
}
export default connect(mapStateToProps)(DDSButton)
