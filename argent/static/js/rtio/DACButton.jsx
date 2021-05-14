import React from 'react'
import PropTypes from 'prop-types'
import Button from '@material-ui/core/Button'
import Popover from '@material-ui/core/Popover'
import Grid from '@material-ui/core/Grid'
import TableCell from '@material-ui/core/TableCell'
import Box from '@material-ui/core/Box'
import Typography from '@material-ui/core/Typography'
import VariableUnitInput from '../components/VariableUnitInput.jsx'
import TextField from '@material-ui/core/TextField'
import ModeSelector from '../ModeSelector.jsx'
import Select from '@material-ui/core/Select'
import MenuItem from '@material-ui/core/MenuItem'
import InputLabel from '@material-ui/core/InputLabel'
import FormControl from '@material-ui/core/FormControl'
import LinkIcon from '@material-ui/icons/Link'
import TrendingUpIcon from '@material-ui/icons/TrendingUp'
import { connect } from 'react-redux'

function DACButton (props) {
  // A Button which opens a Popover allowing the user to define the state of a
  // DAC channel at a timestep. In Constant mode, a single value is held
  // through the timestep. In Ramp mode, the user can generate an
  // intra-timestep linear ramp parameterized by start and stop voltages and
  // a number of steps.
  const [anchorEl, setAnchorEl] = React.useState(null)

  const open = Boolean(anchorEl)

  const constantValue = props.constant.split(' ')[0]
  const displayValue = constantValue === '' ? '' : props.constant

  let color = '#D3D3D3'
  if (props.mode === 'constant' && constantValue !== '') {
    color = '#67001a'
  } else if (props.mode === 'ramp') {
    color = '#004e67'
  } else if (props.mode === 'variable') {
    color = '#67001a'
  }

  const constantStyle = {
    background: `linear-gradient(90deg, ${color} 0%, ${color} 100%)`,
    opacity: 1,
    color: 'white',
    fontSize: 10,
    textTransform: 'none'
  }

  const handleContextMenu = (event) => {
    event.preventDefault()
    setAnchorEl(event.currentTarget)
  }

  return (
    <TableCell component="th" scope="row" key={props.timestep}>
      <Button variant="contained"
              disableRipple={true}
              style={constantStyle}
              onContextMenu={handleContextMenu}
              >
        {props.mode === 'variable'
          ? <LinkIcon/>
          : props.mode === 'ramp'
            ? <TrendingUpIcon/>
            : <Typography style={constantStyle}> {displayValue} </Typography>
      }
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
        <Typography style={{ fontWeight: 'bold', fontSize: 24 }}>
            DAC options
        </Typography>
        <Box m={1}>
          <ModeSelector label={'Setpoint mode'}
                        value={props.mode}
                        onChange = {(event) => props.updateMode(event.target.value)}
                        ramp = {true}
          />
        </Box>

        {(props.mode === 'constant')
          ? (
            <Box m={1}>
              <VariableUnitInput value={props.constant}
                                 onChange = {(value) => props.updateSetpoint(value)}
                                 units = {['V', 'mV', 'uV']}
                                 label = 'Setpoint'
                                 style={{ width: '100%' }}
              />
            </Box>

            )
          : null
      }

      {props.mode === 'ramp'
        ? (
          <React.Fragment>
          <Grid container spacing={1} style={{ width: '300px' }}>
          <Grid item xs={4}>
            <VariableUnitInput value={props.ramp.start}
                           onChange = {props.updateStart}
                           units = {['V', 'mV', 'uV']}
                           label = 'Start'
            />
          </Grid>
          <Grid item xs={4}>
            <VariableUnitInput value={props.ramp.stop}
                           onChange = {props.updateStop}
                           units = {['V', 'mV', 'uV']}
                           label = 'Stop'
            />
          </Grid>
          <Grid item xs={4}>
            <TextField label='Steps'
                       value={props.ramp.steps}
                       onChange={(event) => props.updateSteps(event.target.value)}
                       InputLabelProps={{ shrink: true }}
            />
          </Grid>
          </Grid>
          </React.Fragment>
          )
        : null}

        {(props.mode === 'variable' && Object.keys(props.variables).length > 0)
          ? (
            <Box m={1}>
              <FormControl>
              <InputLabel shrink={true}> Variable </InputLabel>
              <Select label="Variable"
                      value={props.variable}
                      onChange = {(event) => props.updateVariable(event.target.value)}
                      style={{ width: '300px' }}
                      >
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

      {(props.mode === 'variable' && Object.keys(props.variables).length === 0)
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
  ch: PropTypes.string,
  board: PropTypes.string,
  timestep: PropTypes.number,
  dispatch: PropTypes.func,
  constant: PropTypes.string,
  ramp: PropTypes.object,
  variable: PropTypes.string,
  mode: PropTypes.string,
  variables: PropTypes.object,
  updateMode: PropTypes.func,
  updateSetpoint: PropTypes.func,
  updateStart: PropTypes.func,
  updateStop: PropTypes.func,
  updateSteps: PropTypes.func,
  updateVariable: PropTypes.func
}

function mapDispatchToProps (dispatch, props) {
  const path = {
    ch: props.ch,
    timestep: props.timestep,
    board: props.board
  }

  return {
    updateMode: (value) => dispatch({
      type: 'dac/mode',
      value: value,
      path: path
    }),

    updateSetpoint: (value) => dispatch({
      type: 'dac/setpoint',
      value: value,
      path: path
    }),

    updateStart: (value) => dispatch({
      type: 'dac/ramp/start',
      value: value,
      path: path
    }),

    updateStop: (value) => dispatch({
      type: 'dac/ramp/stop',
      value: value,
      path: path
    }),

    updateSteps: (value) => dispatch({
      type: 'dac/ramp/steps',
      value: value,
      path: path
    }),

    updateVariable: (value) => dispatch({
      type: 'dac/variable',
      value: value,
      path: path
    })

  }
}

function mapStateToProps (state, props) {
  const channel = state.sequences[state.active_sequence].steps[props.timestep].dac[props.board][props.ch] || {}
  const ramp = channel.ramp || {start: ' V', stop: ' V', steps: 100}
  // const mode = typeof (channel.variable) !== 'undefined' ? 'variable': typeof (channel.ramp) !== 'undefined' ? 'ramp': 'constant'
  const mode = channel.mode
  return {
    mode: mode,
    constant: channel.constant || '',
    ramp: ramp,
    variable: channel.variable || '',
    variables: state.sequences[state.active_sequence].inputs
  }
}
export default connect(mapStateToProps, mapDispatchToProps)(DACButton)
