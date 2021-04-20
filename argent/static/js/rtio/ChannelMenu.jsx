import React from 'react'
import PropTypes from 'prop-types'
import Menu from '@material-ui/core/Menu'
import MenuItem from '@material-ui/core/MenuItem'
import ListItemText from '@material-ui/core/ListItemText'
import { connect } from 'react-redux'

function ChannelMenu (props) {
  // A context menu with options for RTIO channels, such as designating a given
  // channel or all other channels as inactive.

  const dispatch = (type) => {
    props.dispatch({ type: type, channel: props.state.ch, channel_type: props.state.type, board: props.state.board })
    props.close()
  }

  return (
      <Menu
        anchorEl={props.state.anchor}
        open={Boolean(props.state.anchor)}
        onClose={props.close}
        anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
        transformOrigin={{ horizontal: 'left', vertical: 'top' }}
        getContentAnchorEl={null}
      >
        <MenuItem onClick={() => dispatch('ui/setInactive')}>
          <ListItemText primary="Set inactive" />
        </MenuItem>
        <MenuItem onClick={() => dispatch('ui/setOthersInactive')}>
          <ListItemText primary="Set others inactive" />
        </MenuItem>
        <MenuItem onClick={() => dispatch('ui/setBelowInactive')}>
          <ListItemText primary="Set below inactive" />
        </MenuItem>
      </Menu>
  )
}

ChannelMenu.propTypes = {
  state: PropTypes.object,
  close: PropTypes.func,
  dispatch: PropTypes.func
}

function mapStateToProps (state, ownProps) {
  return {}
}
export default connect(mapStateToProps)(ChannelMenu)
