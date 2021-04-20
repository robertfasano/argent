import React from 'react'
import PropTypes from 'prop-types'
import Button from '@material-ui/core/Button'
import Popover from '@material-ui/core/Popover'
import TableCell from '@material-ui/core/TableCell'
import Box from '@material-ui/core/Box'
import Typography from '@material-ui/core/Typography'
import FixedUnitInput from '../components/FixedUnitInput.jsx'
import { connect } from 'react-redux'
import ModeSelector from '../ModeSelector.jsx'
import FormControl from '@material-ui/core/FormControl'
import Select from '@material-ui/core/Select'
import MenuItem from '@material-ui/core/MenuItem'
import InputLabel from '@material-ui/core/InputLabel'
import LinkIcon from '@material-ui/icons/Link'

function DDSButton (props) {
  // A Button which opens a Popover allowing the user to define the state of a
  // DAC channel at a timestep. In Constant mode, a single value is held
  // through the timestep. In Ramp mode, the user can generate an
  // intra-timestep linear ramp parameterized by start and stop voltages and
  // a number of steps.
  const [anchorEl, setAnchorEl] = React.useState(null)
  const open = Boolean(anchorEl)
  const color = props.enable ? '#67001a' : '#D3D3D3'
  const style = {
    background: `linear-gradient(90deg, ${color} 0%, ${color} 100%)`,
    opacity: 1,
    color: props.enable ? 'white' : 'black',
    fontSize: 10,
    textTransform: 'none'
  }

  const handleContextMenu = (event) => {
    event.preventDefault()
    setAnchorEl(event.currentTarget)
  }

  return (
    <TableCell component="th" scope="row">
      <Button variant="contained"
              disableRipple={true}
              style={style}
              onContextMenu={handleContextMenu}
              onClick={props.toggleSwitch}
              >
      {props.mode === 'variable'
        ? <LinkIcon/>
        : <Typography style={style}> {props.constant === '' ? '' : props.constant + ' MHz'} </Typography>
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
              DDS options
          </Typography>
          <Box m={1}>
            <ModeSelector label={'Frequency mode'}
                          value={props.mode}
                          ramp={false}
                          onChange = {(event) => props.updateMode(event.target.value)}
            />
        </Box>
        {(props.mode === 'constant') ?
          <Box m={1}>
            <FixedUnitInput value={props.constant}
                               onChange = {props.updateFrequency}
                               unit = 'MHz'
                               label='Frequency'
                               style={{ width: '100%' }}
            />
          </Box>
          : null
        }
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
          <Box m={1}>
            <FixedUnitInput value={props.attenuation}
                               onChange = {props.updateAttenuation}
                               unit = 'dB'
                               label='Attenuation'
                               style={{ width: '100%' }}
            />
          </Box>
          </Box>
      </Popover>
    </TableCell>
  )
}

DDSButton.propTypes = {
  enable: PropTypes.bool,
  frequency: PropTypes.string,
  attenuation: PropTypes.string,
  toggleSwitch: PropTypes.func,
  updateFrequency: PropTypes.func,
  updateAttenuation: PropTypes.func
}

function mapDispatchToProps (dispatch, props) {
  const path = {
    ch: props.ch,
    timestep: props.timestep
  }

  return {
    updateMode: (value) => dispatch({
      type: 'dds/mode',
      value: value,
      path: path
    }),
    updateAttenuation: (event) => dispatch({
      type: 'dds/attenuation',
      value: event.target.value,
      path: path
    }),
    updateFrequency: (event) => dispatch({
      type: 'dds/frequency',
      value: event.target.value,
      path: path
    }),
    toggleSwitch: () => dispatch({
      type: 'dds/toggle',
      path: path
    }),
    updateVariable: (value) => dispatch({
      type: 'dds/variable',
      value: value,
      path: path
    })
  }
}

function mapStateToProps (state, props) {
  const channel = state.sequences[state.active_sequence].steps[props.timestep].dds[props.ch]
  const frequency = channel.frequency

  return {
    enable: channel.enable,
    mode: frequency.mode,
    constant: frequency.constant,
    variable: frequency.variable,
    attenuation: channel.attenuation,
    variables: state.sequences[state.active_sequence].inputs
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(DDSButton)
