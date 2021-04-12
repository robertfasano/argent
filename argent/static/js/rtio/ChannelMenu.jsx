import React from 'react'
import PropTypes from 'prop-types'
import Menu from '@material-ui/core/Menu'
import MenuItem from '@material-ui/core/MenuItem'
import ListItemText from '@material-ui/core/ListItemText'
import { connect } from 'react-redux'

function ChannelMenu (props) {
  // A context menu with options for RTIO channels, such as designating a given
  // channel or all other channels as inactive.
  const handleClose = () => {
    props.setAnchorEl(null)
  }

  const dispatch = (type) => {
    props.dispatch({ type: type, channel: props.anchorName, channel_type: props.anchorType, board: props.anchorBoard })
    handleClose()
  }

  return (
      <Menu
        anchorEl={props.anchorEl}
        open={Boolean(props.anchorEl)}
        onClose={handleClose}
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
  anchorEl: PropTypes.object,
  setAnchorEl: PropTypes.func,
  anchorName: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  type: PropTypes.string,
  dispatch: PropTypes.func,
  anchorType: PropTypes.string,
  anchorBoard: PropTypes.string
}

function mapStateToProps (state, ownProps) {
  return {}
}
export default connect(mapStateToProps)(ChannelMenu)
