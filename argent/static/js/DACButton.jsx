import React from 'react';
import Button from '@material-ui/core/Button';
import Popover from '@material-ui/core/Popover';
import TableCell from '@material-ui/core/TableCell';
import Grid from '@material-ui/core/Grid'
import Box from '@material-ui/core/Box'
import ScaledInput from './ScaledInput.jsx'
import ModeSelector from './ModeSelector.jsx'
import TextField from '@material-ui/core/TextField'
import {gradient} from './colors.js'
import {connect} from 'react-redux'

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
  const open = Boolean(Boolean(anchorEl) & Boolean(!props.reserved));
  function dispatch(type, value) {
    props.dispatch({type: type,
                    timestep: props.timestep,
                    channel: props.channel,
                    value: value})
  }
  function getImplicitValues() {
    let implicitSetpoint = props.setpoint
    let i = props.timestep-1
    while (i >= 0 & implicitSetpoint == '') {
      let voltage = props.sequence[i]
      implicitSetpoint = voltage.mode == 'constant'? voltage.setpoint : voltage.stop
      i -= 1
    }


    let implicitStart = props.start
    i = props.timestep-1
    while (i >= 0 & implicitStart == '') {
      let voltage = props.sequence[i]
      implicitStart = voltage.mode == 'constant'? voltage.setpoint : voltage.stop
      i -= 1
    }

    let implicitStop = props.stop == ''? implicitStart: props.stop

    return {setpoint: implicitSetpoint, start: implicitStart, stop: implicitStop}
  }
  let implicit = getImplicitValues()

  let color = getColor(implicit.setpoint)
  let constantStyle = {background: `linear-gradient(90deg, ${color} 0%, ${color} 100%)`, opacity: props.reserved? 0.15: 1} // changing gradient to uniform color is faster than setting backgroundColor
  let ramp = `linear-gradient(90deg, ${getColor(implicit.start)} 0%, ${getColor(implicit.stop)} 100%)`
  let rampStyle = {background: ramp, opacity: props.reserved? 0.15: 1}
  return (
    <TableCell component="th" scope="row" key={props.timestep}>
      <Button variant="contained"
              disableRipple={true}
              style={props.mode=='constant'? constantStyle: rampStyle}
              onClick={(event) => setAnchorEl(event.currentTarget)}
              > <div/>
      </Button>
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={(event) => setAnchorEl(null)}
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
                        onChange = {(event) => dispatch('dac/mode', event.target.value)}
          />
        </Box>
        {props.mode=='constant'? (
          <Box m={1}>
            <ScaledInput value={props.setpoint}
                         placeholder={implicit.setpoint}
                         onChange = {(value) => dispatch('dac/setpoint', value)}
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
                         placeholder={implicit.start}
                           onChange = {(value) => dispatch('dac/start', value)}
                           units = {{'V': 1, 'mV': 1e-3, 'uV': 1e-6}}
                           label = 'Start'
                           variant = 'outlined'
            />
          </Box>
          <Box m={1}>
            <ScaledInput value={props.stop}
                         placeholder={implicit.stop}
                         onChange = {(value) => dispatch('dac/stop', value)}
                         units = {{'V': 1, 'mV': 1e-3, 'uV': 1e-6}}
                         label = 'Stop'
                         variant = 'outlined'
            />
          </Box>
          <Box m={1}>
            <TextField label='Steps'
                       value={props.steps}
                       onChange={(event) => dispatch('dac/steps', event.target.value)}
                       variant='outlined'
                       InputLabelProps={{ shrink: true }}
            />
          </Box>
          </React.Fragment>
        ):
        null}
      </Popover>
    </TableCell>
)}


function mapStateToProps(state, ownProps){
  let dict = state['sequence']['dac'][ownProps.channel][ownProps.timestep]
  let sequence = state['sequence']['dac'][ownProps.channel]
  return {setpoint: dict.setpoint,
          start: dict.start,
          stop: dict.stop,
          mode: dict.mode,
          sequence: sequence,
          reserved: dict.reserved,
          steps: dict.steps
        }
}
export default connect(mapStateToProps)(DACButton)
