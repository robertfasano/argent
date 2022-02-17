import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import Menu from '@material-ui/core/Menu'
import MenuItem from '@material-ui/core/MenuItem'

function TTLContextMenu (props) {
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
    </Menu>
  )
}

TTLContextMenu.propTypes = {
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
      dispatch({ type: 'ttl/setAll', channel: props.state.channel, value: state })
      props.close()
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(TTLContextMenu)
