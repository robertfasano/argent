import React from 'react';
import Button from '@material-ui/core/Button';
import Popover from '@material-ui/core/Popover';
import TableCell from '@material-ui/core/TableCell';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import Grid from '@material-ui/core/Grid'
import Box from '@material-ui/core/Box'
import ScaledInput from './ScaledInput.jsx'
import ModeSelector from './ModeSelector.jsx'
import {gradient} from './colors.js'
import {connect} from 'react-redux'
import {actions} from './reducers/reducer.js'


function getColor(value) {
  let color = "#D3D3D3"
  if (value == "") {
    return color
  }
  if (value < 0) {
    color = gradient('#D3D3D3', "#67001a", 0, 10, -value)
  }
  else if (value > 0) {
    color = gradient('#D3D3D3', "#004e67", 0, 10, value)
  }
  return color
}

function DACButton(props) {
  const [anchorEl, setAnchorEl] = React.useState(null)

  const handleModeChange = event => {
    props.dispatch(actions.dac.setMode(props.timestep, props.channel, event.target.value))
  };


  const handleClick = event => {
    setAnchorEl(event.currentTarget)
  }
  const handleClose = () => {
    setAnchorEl(null)
  }
  const open = Boolean(anchorEl);

  function updateVoltage(value) {
    props.dispatch(actions.dac.update(props.timestep, props.channel, value))
  }
  function updateStart(value) {
    props.dispatch(actions.dac.updateStart(props.timestep, props.channel, value))
  }
  function updateStop(value) {
    props.dispatch(actions.dac.updateStop(props.timestep, props.channel, value))
  }

  let color = getColor(props.value)
  let constantStyle = {background: `linear-gradient(90deg, ${color} 0%, ${color} 100%)`} // changing gradient to uniform color is faster than setting backgroundColor
  let ramp = `linear-gradient(90deg, ${getColor(props.start)} 0%, ${getColor(props.stop)} 100%)`
  let rampStyle = {background: ramp}
  return (
    <TableCell component="th" scope="row" key={props.timestep}>
      <Button variant="contained"
              disableRipple={true}
              style={props.mode=='constant'? constantStyle: rampStyle}
              onClick={(event) => handleClick(event)}
              > <div/>
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
        <ModeSelector label={"Voltage"}
                      value={props.mode}
                      onChange={handleModeChange}
        />
      </Box>
      {props.mode=='constant'? (
        <Box m={1}>
          <ScaledInput value={props.value}
                         onChange = {updateVoltage}
                         units = {{'V': 1, 'mV': 1e-3, 'uV': 1e-6}}
                         label = 'Setpoint'
                         variant = 'outlined'
          />
        </Box>
      ):
      null}
      {props.mode=='ramp'? (
        <React.Fragment>
        <Box m={1}>
          <ScaledInput value={props.start}
                         onChange = {updateStart}
                         units = {{'V': 1, 'mV': 1e-3, 'uV': 1e-6}}
                         label = 'Start'
                         variant = 'outlined'
          />
        </Box>
        <Box m={1}>
          <ScaledInput value={props.stop}
                         onChange = {updateStop}
                         units = {{'V': 1, 'mV': 1e-3, 'uV': 1e-6}}
                         label = 'Stop'
                         variant = 'outlined'
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
  let dict = state['sequence'][ownProps.timestep]['dac'][ownProps.channel]
  return {value: dict.setpoint,
          start: dict.start,
          stop: dict.stop,
          mode: dict.mode
        }
}
export default connect(mapStateToProps)(DACButton)
