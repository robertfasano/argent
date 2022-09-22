import React from 'react'
import PropTypes from 'prop-types'
import Button from '@material-ui/core/Button'
import TableCell from '@material-ui/core/TableCell'
import Typography from '@material-ui/core/Typography'
import { connect } from 'react-redux'
import { selectTimestep, selectPresentState, selectVariableValues } from '../../selectors.js'

function DDSButton (props) {
  // A Button which opens a Popover allowing the user to define the state of a
  // DAC channel at a timestep. In Setpoint mode, a single value is held
  // through the timestep. In Ramp mode, the user can generate an
  // intra-timestep linear ramp parameterized by start and stop voltages and
  // a number of steps.
  const [anchorEl, setAnchorEl] = React.useState(null)

  const handleContextMenu = (event) => {
    event.preventDefault()
    setAnchorEl(event.currentTarget)
  }

  const color = props.enable ? '#67001a' : '#D3D3D3'

  const style = {
    background: `linear-gradient(90deg, ${color} 0%, ${color} 100%)`,
    color: props.enable ? 'white' : 'black',
    fontSize: 10,
    textTransform: 'none',
    whiteSpace: 'pre-line',
    opacity: props.skip ? 0.25 : 1
  }

  let displayText = ''
  if (props.attenuation.setpoint.includes('self.')) {
    displayText = props.variables[props.attenuation.setpoint.split('self.')[1]] + ' dB'
  } else if (props.attenuation.setpoint !== '') {
    displayText = props.attenuation.setpoint + ' dB'
  }

  return (
    <>
    <TableCell component="th" scope="row">
        <Button variant="contained"
                disableRipple={true}
                style={style}
                onClick={props.toggleSwitch}
                onContextMenu={props.onContextMenu}
                >
        <Typography style={style}> {displayText} </Typography>
        </Button>
      </TableCell>
    </>
  )
}

DDSButton.propTypes = {
  enable: PropTypes.bool,
  frequency: PropTypes.object,
  attenuation: PropTypes.object,
  toggleSwitch: PropTypes.func,
  variables: PropTypes.object,
  update: PropTypes.func,
  ch: PropTypes.string,
  timestep: PropTypes.number,
  skip: PropTypes.bool
}

function mapDispatchToProps (dispatch, props) {
  const path = {
    ch: props.ch,
    timestep: props.timestep
  }

  return {
    update: (type, value) => dispatch({ type, value, path }),

    toggleSwitch: () => dispatch({
      type: 'dds/toggle',
      path: path
    })

  }
}

function mapStateToProps (state, props) {
  state = selectPresentState(state)
  const timestep = selectTimestep(state, props.timestep)
  const channel = timestep.dds[props.ch]

  return {
    enable: channel.enable,
    attenuation: channel.attenuation,
    frequency: channel.frequency,
    variables: selectVariableValues(state),
    skip: timestep.skip
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(DDSButton)
