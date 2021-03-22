import React from 'react'
import PropTypes from 'prop-types'
import Button from '@material-ui/core/Button'
import Popover from '@material-ui/core/Popover'
import TableCell from '@material-ui/core/TableCell'
import Box from '@material-ui/core/Box'
import Typography from '@material-ui/core/Typography'
import VariableUnitInput from '../components/VariableUnitInput.jsx'
import TextField from '@material-ui/core/TextField'
import ModeSelector from '../ModeSelector.jsx'
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import InputLabel from '@material-ui/core/InputLabel';
import FormHelperText from '@material-ui/core/FormHelperText';
import FormControl from '@material-ui/core/FormControl';
import { connect } from 'react-redux'


function parseFunctionalSetpoint (str) {
  const type = str.split('(')[0]
  const args = str.replace(type, '').replace('(', '').replace(')', '').split(',')
  return {type: type, arguments: args}
}

function createFunctionalSetpoint (type, args) {
  return type + '(' + args.join(',') + ')'
}

function updateFunctionalSetpoint (setpoint, index, value) {
  const args = parseFunctionalSetpoint(setpoint).arguments
  args[index] = value
  return createFunctionalSetpoint(parseFunctionalSetpoint(setpoint).type, args)
}

function DACButton (props) {
  // A Button which opens a Popover allowing the user to define the state of a
  // DAC channel at a timestep. In Constant mode, a single value is held
  // through the timestep. In Ramp mode, the user can generate an
  // intra-timestep linear ramp parameterized by start and stop voltages and
  // a number of steps.
  const [anchorEl, setAnchorEl] = React.useState(null)

  const open = Boolean(anchorEl)

  // const mode = props.setpoint.includes('Ramp') ? 'ramp' : 'constant'

  let mode = 'constant'
  if (props.setpoint.includes('Ramp')) {
    mode = 'ramp'
  }
  if (props.setpoint.includes('Var')) {
    mode = 'variable'
  }

  let displayValue = props.setpoint
  if (mode === 'constant') {
    const [value] = props.setpoint.split(' ')[0]
    if (value === '') {
      displayValue = ''
    }
  }

  let color = '#D3D3D3'
  if (mode === 'constant' && props.setpoint.split(' ')[0] !== '') {
    color = '#67001a'
  } else if (mode === 'ramp') {
    color = '#004e67'
  }
  else if (mode == 'variable') {
    color = '#67001a'
  }

  const constantStyle = {
    background: `linear-gradient(90deg, ${color} 0%, ${color} 100%)`,
    opacity: 1,
    color: 'white',
    fontSize: 10,
    textTransform: 'none'
  }

  function changeMode (newMode) {
    if (newMode === 'ramp') {
      const newSetpoint = createFunctionalSetpoint('Ramp', ['0 V', '1 V', 100])
      props.updateSetpoint(newSetpoint)
    } else if (newMode == 'variable') {
      const firstVariable = Object.keys(props.variables)[0] || ''
      props.updateSetpoint(`Var(${firstVariable})`)
    } else {
      props.updateSetpoint('')
    }
  }

  function updateRamp (field, value) {
    const newState = updateFunctionalSetpoint(props.setpoint, field, value)
    props.updateSetpoint(newState)
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
          horizontal: 'right'
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left'
        }}
      >
      <Box p={1}>
        <Box m={1}>
          <ModeSelector label={'Setpoint mode'}
                        value={mode}
                        onChange = {(event) => changeMode(event.target.value)}
          />
        </Box>
        {(mode === 'constant')
          ? (
            <Box m={1}>
              <VariableUnitInput value={props.setpoint}
                                 onChange = {(value) => props.updateSetpoint(value)}
                                 units = {['V', 'mV', 'uV']}
                                 label = 'Setpoint'
              />
            </Box>

            )
          : null
      }
      {mode === 'ramp'
        ? (
          <React.Fragment>
          <Box m={1}>
            <VariableUnitInput value={parseFunctionalSetpoint(props.setpoint).arguments[0]}
                           onChange = {(value) => updateRamp(0, value)}
                           units = {['V', 'mV', 'uV']}
                           label = 'Start'
                           variant = 'outlined'
            />
          </Box>
          <Box m={1}>
            <VariableUnitInput value={parseFunctionalSetpoint(props.setpoint).arguments[1]}
                           onChange = {(value) => updateRamp(1, value)}
                           units = {['V', 'mV', 'uV']}
                           label = 'Stop'
                           variant = 'outlined'
            />
          </Box>
          <Box m={1}>
            <TextField label='Steps'
                       value={parseFunctionalSetpoint(props.setpoint).arguments[2]}
                       onChange={(event) => updateRamp(2, event.target.value)}
                       variant='outlined'
                       InputLabelProps={{ shrink: true }}
            />
          </Box>
          </React.Fragment>
          )
        : null}
        {(mode === 'variable' && Object.keys(props.variables).length > 0)
          ? (
            <Box m={1}>
              <FormControl>
              <InputLabel shrink={true}> Variable </InputLabel>
              <Select label="Variable"
                      value={parseFunctionalSetpoint(props.setpoint).arguments[0]}
                      onChange = {(event) => props.updateSetpoint(updateFunctionalSetpoint(props.setpoint, 0, event.target.value))}>
                {Object.keys(props.variables).map((key, index) => (
                  <MenuItem value={key} key={key}>
                    {key}
                  </MenuItem>
                ))}
              </Select>
              </FormControl>
            </Box>
            )
          : null
      }
      {(mode == 'variable' && Object.keys(props.variables).length == 0)
        ? (
          <Typography> Define a variable first. </Typography>
        )
        : null

    }
        </Box>
      </Popover>
    </TableCell>
  )
}

DACButton.propTypes = {
  setpoint: PropTypes.string,
  updateSetpoint: PropTypes.func,
  sequenceName: PropTypes.string,
  ch: PropTypes.number,
  board: PropTypes.string,
  timestep: PropTypes.number,
  dispatch: PropTypes.func
}

function mapDispatchToProps (dispatch, props) {
  const path = {
    sequenceName: props.sequenceName,
    ch: props.ch,
    timestep: props.timestep,
    board: props.board
  }

  return {
    updateSetpoint: (value) => dispatch({
      type: 'dac/setpoint',
      value: value,
      path: path
    })
  }
}

function mapStateToProps (state, props) {
  return {
    setpoint: state.sequences[props.sequenceName].steps[props.timestep].dac[props.board][props.ch] || '',
    variables: state.sequences[props.sequenceName].inputs
  }
}
export default connect(mapStateToProps, mapDispatchToProps)(DACButton)
