import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import Menu from '@material-ui/core/Menu'
import MenuItem from '@material-ui/core/MenuItem'

function TimestepContextMenu (props) {
  // A context menu allowing timesteps to be inserted, reordered, or deleted.

  return (
    <Menu
      anchorEl={props.anchorEl}
      open={props.open}
      onClose={() => props.setAnchorEl(null)}
    >
      {props.timestep > 0
        ? <MenuItem onClick={props.moveLeft}>
          Move left
        </MenuItem>
        : null}
      {props.timestep < props.length - 1
        ? <MenuItem onClick={props.moveRight}>
          Move right
        </MenuItem>
        : null}
      <MenuItem onClick={props.insertLeft}>
        Insert left
      </MenuItem>
      <MenuItem onClick={props.insertRight}>
        Insert right
      </MenuItem>
      {props.length > 1
        ? <MenuItem onClick={props.deleteTimestep}>
          Delete
        </MenuItem>
        : null}
    </Menu>
  )
}

TimestepContextMenu.propTypes = {
  open: PropTypes.bool,
  timestep: PropTypes.number,
  length: PropTypes.number,
  anchorEl: PropTypes.object,
  setAnchorEl: PropTypes.func,
  moveLeft: PropTypes.func,
  moveRight: PropTypes.func,
  insertLeft: PropTypes.func,
  insertRight: PropTypes.func,
  deleteTimestep: PropTypes.func
}

function mapStateToProps (state, props) {
  return { open: Boolean(props.anchorEl) }
}

function mapDispatchToProps (dispatch, props) {
  return {
    moveLeft: () => {
      dispatch({ type: 'timestep/swap', a: props.timestep, b: props.timestep - 1, sequenceName: props.sequenceName })
      props.setAnchorEl(null)
    },
    moveRight: () => {
      dispatch({ type: 'timestep/swap', a: props.timestep, b: props.timestep + 1, sequenceName: props.sequenceName })
      props.setAnchorEl(null)
    },
    insertLeft: () => {
      dispatch({ type: 'timestep/insert', timestep: props.timestep - 1, sequenceName: props.sequenceName })
      props.setAnchorEl(null)
    },
    insertRight: () => {
      dispatch({ type: 'timestep/insert', timestep: props.timestep, sequenceName: props.sequenceName })
      props.setAnchorEl(null)
    },
    deleteTimestep: () => {
      dispatch({ type: 'timestep/delete', timestep: props.timestep, sequenceName: props.sequenceName })
      props.setAnchorEl(null)
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(TimestepContextMenu)
