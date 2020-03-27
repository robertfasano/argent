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

function getColor(value) {
  if (value == "") {
    return '#004e67'
  }
  return gradient('#004e67', "#D3D3D3", 0, 31.5, value)
}

function DDSButton(props) {
  const [anchorEl, setAnchorEl] = React.useState(null)

  let color = "#D3D3D3"
  if (props.on) {
    color = getColor(props.attenuation.setpoint)
  }
  let constantStyle = {background: `linear-gradient(90deg, ${color} 0%, ${color} 100%)`}  // changing gradient to uniform color is faster than setting backgroundColor
  let ramp = `linear-gradient(90deg, ${getColor(props.attenuation.start)} 0%, ${getColor(props.attenuation.stop)} 100%)`
  let rampStyle = props.on? {background: ramp}: constantStyle
  let style = props.attenuation.mode=='constant'? constantStyle: rampStyle

  const handleClick = event => {
    setAnchorEl(event.currentTarget)
  }
  const handleClose = () => {
    setAnchorEl(null)
  }
  const open = Boolean(anchorEl);

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
                        value={props.frequency.mode}
                        onChange = {(event) => dispatch('dds/frequency/mode', event.target.value)}

          />
        </Box>
        {props.frequency.mode=='constant'? (
          <Box m={1}>
            <ScaledInput value={props.frequency.setpoint}
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
                           onChange = {(value) => dispatch('dds/frequency/start', value)}
                           units = {{'Hz': 1, 'kHz': 1e3, 'MHz': 1e6}}
                           label = 'Start'
                           variant = 'outlined'
            />
          </Box>
          <Box m={1}>
            <ScaledInput value={props.frequency.stop}
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
                            onChange = {(event) => dispatch('dds/attenuation/start', event.target.value)}
                            label = 'Start'
                            unit = 'dB'
            />
          </Box>
          <Box m={1}>
            <FixedUnitInput value={props.attenuation.stop}
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
  let dict = state['sequence'][ownProps.timestep]['dds'][ownProps.channel]
  return {frequency: dict.frequency,
          attenuation: dict.attenuation,
          on: dict.on
        }
}

export default connect(mapStateToProps)(DDSButton)
