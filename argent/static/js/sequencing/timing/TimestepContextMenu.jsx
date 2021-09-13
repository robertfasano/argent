import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import Menu from '@material-ui/core/Menu'
import MenuItem from '@material-ui/core/MenuItem'

function TimestepContextMenu (props) {
  // A context menu allowing timesteps to be inserted, reordered, or deleted.
  return (
    <Menu
      anchorEl={props.state.anchor}
      open={props.open}
      onClose={props.close}
    >
      {props.timestep > 0
        ? <MenuItem onClick={() => props.moveLeft(props.timestep)}>
          Move left
        </MenuItem>
        : null}
      {props.timestep < props.length - 1
        ? <MenuItem onClick={() => props.moveRight(props.timestep)}>
          Move right
        </MenuItem>
        : null}
      <MenuItem onClick={() => props.insertLeft(props.timestep)}>
        Insert left
      </MenuItem>
      <MenuItem onClick={() => props.insertRight(props.timestep)}>
        Insert right
      </MenuItem>
      {props.length > 1
        ? <MenuItem onClick={() => props.deleteTimestep(props.timestep)}>
          Delete
        </MenuItem>
        : null}
    </Menu>
  )
}

TimestepContextMenu.propTypes = {
  state: PropTypes.object,
  open: PropTypes.bool,
  timestep: PropTypes.number,
  length: PropTypes.number,
  close: PropTypes.func,
  moveLeft: PropTypes.func,
  moveRight: PropTypes.func,
  insertLeft: PropTypes.func,
  insertRight: PropTypes.func,
  deleteTimestep: PropTypes.func
}

function mapStateToProps (state, props) {
  return {
    open: Boolean(props.state.anchor),
    timestep: props.state.index
  }
}

function mapDispatchToProps (dispatch, props) {
  return {
    moveLeft: (timestep) => {
      dispatch({ type: 'timestep/swap', a: timestep, b: timestep - 1 })
      props.close()
    },
    moveRight: (timestep) => {
      dispatch({ type: 'timestep/swap', a: timestep, b: timestep + 1 })
      props.close()
    },
    insertLeft: (timestep) => {
      dispatch({ type: 'timestep/insert', timestep: timestep - 1 })
      props.close()
    },
    insertRight: (timestep) => {
      dispatch({ type: 'timestep/insert', timestep: timestep })
      props.close()
    },
    deleteTimestep: (timestep) => {
      dispatch({ type: 'timestep/delete', timestep: timestep })
      props.close()
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(TimestepContextMenu)