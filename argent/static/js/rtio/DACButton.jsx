import React from 'react';
import Button from '@material-ui/core/Button';
import Popover from '@material-ui/core/Popover';
import TableCell from '@material-ui/core/TableCell';
import Grid from '@material-ui/core/Grid'
import Box from '@material-ui/core/Box'
import Typography from '@material-ui/core/Typography'
import VariableUnitInput from '../components/VariableUnitInput.jsx'
import TextField from '@material-ui/core/TextField'
import ModeSelector from '../ModeSelector.jsx'
import {gradient} from '../colors.js'
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
  const open = Boolean(Boolean(anchorEl));

  const mode = props.setpoint.includes('Ramp')? 'ramp' : 'constant'

  let displayValue = props.setpoint
  if (mode == 'constant') {
    let [value, unit] = props.setpoint.split(' ')
    if (value == '') {
      displayValue = ''
    }
  }

  let color = "#D3D3D3"
  if (mode == 'constant' && props.setpoint.split(' ')[0] != '') {
    color = "#67001a"
  }
  else if (mode == 'ramp') {
    color = "#004e67"
  }

  let constantStyle = {background: `linear-gradient(90deg, ${color} 0%, ${color} 100%)`,
                       opacity: 1,
                       color: 'white',
                       fontSize: 10,
                       textTransform: 'none'}


  function changeMode(newMode) {
    if (newMode == 'ramp') {
      props.dispatch({type: 'dac/setpoint', voltage: 'Ramp(0 V,1 V,10)', sequenceName: props.sequenceName, ch: props.ch, board: props.board, timestep: props.timestep})
    }
    else {
      props.dispatch({type: 'dac/setpoint', voltage: '', sequenceName: props.sequenceName, ch: props.ch, board: props.board, timestep: props.timestep})

    }
  }

  function parseRamp() {
    let ramp = props.setpoint.replace('Ramp(', '').replace(')', '').split(',')
    return {start: ramp[0] || '',
            stop: ramp[1] || '',
            steps: ramp[2] || ''
          }
  }

  function updateRamp(field, value) {
    let state = parseRamp()
    state[field] = value
    let newState = `Ramp(${state.start},${state.stop},${state.steps})`
    props.dispatch({type: 'dac/setpoint', voltage: newState, sequenceName: props.sequenceName, ch: props.ch, board: props.board, timestep: props.timestep})
  }



  return (
    <TableCell component="th" scope="row" key={props.timestep}>
      <Button variant="contained"
              disableRipple={true}
              style={constantStyle}
              onClick={(event) => setAnchorEl(event.currentTarget)}
              >
        <Typography style={constantStyle}>
        {displayValue}
        </Typography>

      </Button>
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={(event) => setAnchorEl(null)}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
      >
      <Box m={1}>
        <ModeSelector label={"Voltage"}
                      value={mode}
                      onChange = {(event) => changeMode(event.target.value)}
        />
      </Box>
      {mode == 'constant'? (
      <Box m={1}>
        <VariableUnitInput value={props.setpoint}
                       onChange = {(value) =>  props.dispatch({type: 'dac/setpoint', voltage: value, sequenceName: props.sequenceName, ch: props.ch, board: props.board, timestep: props.timestep})}
                       units = {['V', 'mV', 'uV']}
        />
      </Box>

    ) : null
    }
    {mode == 'ramp'? (
      <React.Fragment>
      <Box m={1}>
        <VariableUnitInput value={parseRamp()['start']}
                       onChange = {(value) => updateRamp('start', value)}
                       units = {['V', 'mV', 'uV']}
                       label = 'Start'
                       variant = 'outlined'
        />
      </Box>
      <Box m={1}>
        <VariableUnitInput value={parseRamp()['stop']}
                       onChange = {(value) => updateRamp('stop', value)}
                       units = {['V', 'mV', 'uV']}
                       label = 'Stop'
                       variant = 'outlined'
        />
      </Box>
      <Box m={1}>
        <TextField label='Steps'
                   value={parseRamp()['steps']}
                   onChange={(event) => updateRamp('steps', event.target.value)}
                   variant='outlined'
                   InputLabelProps={{ shrink: true }}
        />
      </Box>
      </React.Fragment>
    ): null}


      </Popover>
    </TableCell>
)}

function mapStateToProps(state, props){
  return {
          setpoint: state['sequences'][props.sequenceName][props.timestep].dac[props.board][props.ch] || '',
        }
}
export default connect(mapStateToProps)(DACButton)
