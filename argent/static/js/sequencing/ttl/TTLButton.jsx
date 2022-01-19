import React from 'react'
import PropTypes from 'prop-types'
import Button from '@material-ui/core/Button'
import TableCell from '@material-ui/core/TableCell'
import { connect } from 'react-redux'

function TTLButton (props) {
  // A simple boolean Button allowing the TTL state at a timestep to be toggled.
  return (
    <TableCell component="th" scope="row">
      <Button variant="contained"
              disableRipple={true}
              style={{ backgroundColor: props.on ? '#67001a' : '#D3D3D3', opacity: props.skip ? 0.25 : 1 }}
              onClick={props.toggle}
              >
      <React.Fragment/>
      </Button>
    </TableCell>
  )
}

TTLButton.propTypes = {
  on: PropTypes.bool,
  toggle: PropTypes.func,
  skip: PropTypes.bool
}

function mapDispatchToProps (dispatch, props) {
  const path = {
    channel: props.channel,
    timestep: props.timestep
  }

  return {
    toggle: () => dispatch({
      type: 'ttl/toggle',
      path: path
    })
  }
}

function mapStateToProps (state, props) {
  state = state.present
  return {
    on: state.sequences[state.active_sequence].steps[props.timestep].ttl[props.channel],
    skip: state.sequences[state.active_sequence].steps[props.timestep].skip || false
  }
}
export default connect(mapStateToProps, mapDispatchToProps)(TTLButton)
