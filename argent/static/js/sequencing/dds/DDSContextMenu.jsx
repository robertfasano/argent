import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import Menu from '@material-ui/core/Menu'
import MenuItem from '@material-ui/core/MenuItem'

function DDSContextMenu (props) {
  function handlePopover (event) {
    props.handlePopover(props.state.anchor, props.state.channel, props.state.timestep)
    props.close()
  }
  return (
    <Menu
      anchorEl={props.state.anchor}
      open={props.open}
      onClose={props.close}
    >
      <MenuItem onClick={() => props.enableAll(true)}>
        Enable all
      </MenuItem>
      <MenuItem onClick={() => props.enableAll(false)}>
        Disable all
      </MenuItem>
      <MenuItem onClick={handlePopover}>
        Edit
      </MenuItem>
    </Menu>
  )
}

DDSContextMenu.propTypes = {
  state: PropTypes.object,
  channel: PropTypes.string,
  open: PropTypes.bool,
  close: PropTypes.func,
  enableAll: PropTypes.func
}

function mapStateToProps (state, props) {
  return {
    open: Boolean(props.state.anchor),
    channel: props.state.channel
  }
}

function mapDispatchToProps (dispatch, props) {
  return {
    enableAll: (state) => {
      dispatch({ type: 'dds/setAll', channel: props.state.channel, value: state })
      props.close()
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(DDSContextMenu)
