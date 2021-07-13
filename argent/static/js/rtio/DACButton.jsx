import React from 'react'
import PropTypes from 'prop-types'
import Button from '@material-ui/core/Button'
import Popover from '@material-ui/core/Popover'
import TableCell from '@material-ui/core/TableCell'
import Box from '@material-ui/core/Box'
import Typography from '@material-ui/core/Typography'
import TextField from '@material-ui/core/TextField'
import ModeSelector from '../ModeSelector.jsx'
import LinkIcon from '@material-ui/icons/Link'
import TrendingUpIcon from '@material-ui/icons/TrendingUp'
import { connect } from 'react-redux'
import LinkableParameter from '../components/LinkableParameter.jsx'

function DACButton (props) {
  // A Button which opens a Popover allowing the user to define the state of a
  // DAC channel at a timestep. In Setpoint mode, a single value is held
  // through the timestep. In Ramp mode, the user can generate an
  // intra-timestep linear ramp parameterized by start and stop voltages and
  // a number of steps.
  const [anchorEl, setAnchorEl] = React.useState(null)

  const open = Boolean(anchorEl)

  let color = '#D3D3D3'
  if (props.mode === 'setpoint' && props.setpoint !== '') {
    color = '#67001a'
  } else if (props.mode === 'ramp') {
    color = '#67001a'
  }

  const style = {
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
              style={style}
              onContextMenu={handleContextMenu}
      >
        {(props.mode === 'setpoint' && props.setpoint.includes('var'))
          ? <LinkIcon/>
          : props.mode === 'ramp'
            ? <TrendingUpIcon/>
            : <Typography style={style}> {props.setpoint} </Typography>
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

        <ModeSelector label={'Setpoint mode'}
                      value={props.mode}
                      onChange = {(event) => props.update('dac/mode', event.target.value)}
        />

        {(props.mode === 'setpoint')
          ? <LinkableParameter value={props.setpoint} inputs={props.inputs} onChange={(value) => props.update('dac/setpoint', value)} label='Setpoint' unit='V'/>
          : null
        }

        {props.mode === 'ramp'
          ? (
            <>
              <LinkableParameter value={props.ramp.start} inputs={props.inputs} onChange={(value) => props.update('dac/ramp/start', value)} label='Start' unit='V'/>
              <LinkableParameter value={props.ramp.stop} inputs={props.inputs} onChange={(value) => props.update('dac/ramp/stop', value)} label='Stop' unit='V'/>
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
    </TableCell>
  )
}

DACButton.propTypes = {
  ch: PropTypes.string,
  board: PropTypes.string,
  timestep: PropTypes.number,
  setpoint: PropTypes.string,
  ramp: PropTypes.object,
  mode: PropTypes.string,
  inputs: PropTypes.object,
  update: PropTypes.func
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

function mapStateToProps (state, props) {
  const channel = state.sequences[state.active_sequence].steps[props.timestep].dac[props.board][props.ch]
  const ramp = channel.ramp
  const mode = channel.mode
  return {
    mode: mode,
    setpoint: channel.setpoint,
    ramp: ramp,
    inputs: state.inputs
  }
}
export default connect(mapStateToProps, mapDispatchToProps)(DACButton)
