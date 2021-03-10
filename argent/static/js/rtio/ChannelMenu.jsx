import React from 'react';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import BlockIcon from '@material-ui/icons/Block';

import {connect} from 'react-redux'

function ChannelMenu(props) {
  const handleClose = () => {
    props.setAnchorEl(null);
  };

  const dispatch = (type) => {
    props.dispatch({type: type, channel: props.channel, channel_type: props.type})
    handleClose()
  }

  return (
      <Menu
        anchorEl={props.anchorEl}
        open={Boolean(props.anchorEl) && (props.anchorName == props.channel)}
        onClose={handleClose}
        anchorOrigin={{horizontal: 'left', vertical: 'bottom'}}
        transformOrigin={{horizontal: 'left', vertical: 'top'}}
        getContentAnchorEl={null}
      >
        <MenuItem onClick={()=>dispatch('ui/setInactive')}>
          <ListItemText primary="Set inactive" />
        </MenuItem>
        <MenuItem onClick={()=>dispatch('ui/setOthersInactive')}>
          <ListItemText primary="Set others inactive" />
        </MenuItem>
        <MenuItem onClick={()=>dispatch('ui/setBelowInactive')}>
          <ListItemText primary="Set below inactive" />
        </MenuItem>
      </Menu>
  );
}

function mapStateToProps(state, ownProps){
  return {}
}
export default connect(mapStateToProps)(ChannelMenu)
