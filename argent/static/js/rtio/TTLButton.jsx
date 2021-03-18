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
              style={{ backgroundColor: props.on ? '#67001a' : '#D3D3D3', opacity: 1 }}
              onClick={props.toggle}
              >
      <React.Fragment/>
      </Button>
    </TableCell>
  )
}

TTLButton.propTypes = {
  on: PropTypes.bool,
  toggle: PropTypes.func
}

function mapDispatchToProps (dispatch, props) {
  const path = {
    sequenceName: props.sequenceName,
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
  return {
    on: state.sequences[props.sequenceName][props.timestep].ttl[props.channel]
  }
}
export default connect(mapStateToProps, mapDispatchToProps)(TTLButton)
