import React from 'react'
import PropTypes from 'prop-types'
import Button from '@material-ui/core/Button'
import Popover from '@material-ui/core/Popover'
import TableCell from '@material-ui/core/TableCell'
import Box from '@material-ui/core/Box'
import Switch from '@material-ui/core/Switch'
import Typography from '@material-ui/core/Typography'
import FixedUnitInput from '../components/FixedUnitInput.jsx'
import { connect } from 'react-redux'

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
    color: props.enable? 'white': 'black',
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
        <Typography style={style}>
          {props.frequency === ''? '' : props.frequency + ' MHz'}
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
          <Typography style={{fontWeight: 'bold', fontSize: 24}}>
              DDS options
          </Typography>
          <Box m={1}>
            <FixedUnitInput value={props.frequency}
                               onChange = {props.updateFrequency}
                               unit = 'MHz'
                               label='Frequency'
                               style={{width: '100%'}}
            />
          </Box>
          <Box m={1}>
            <FixedUnitInput value={props.attenuation}
                               onChange = {props.updateAttenuation}
                               unit = 'dB'
                               label='Attenuation'
                               style={{width: '100%'}}
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
    sequenceName: props.sequenceName,
    ch: props.ch,
    timestep: props.timestep
  }

  return {
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
    })
  }
}

function mapStateToProps (state, props) {
  const channel = state.sequences[props.sequenceName].steps[props.timestep].dds[props.ch]
  return {
    enable: channel.enable,
    frequency: channel.frequency || '',
    attenuation: channel.attenuation || ''
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(DDSButton)
