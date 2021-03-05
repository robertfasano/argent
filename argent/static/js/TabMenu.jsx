import React from 'react';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import CreateIcon from '@material-ui/icons/Create';
import DeleteIcon from '@material-ui/icons/Delete';
import SaveIcon from '@material-ui/icons/Save';

import {connect} from 'react-redux'

function TabMenu(props) {
  const handleClose = () => {
    props.setAnchorEl(null);
  };

  const rename = () => {
    const newName = prompt('Enter new sequence name:')
    props.dispatch({type: 'sequence/rename', name: props.name, newName: newName})
    handleClose()
  }

  const handleDelete = () => {
    props.dispatch({type: 'sequence/close', name: props.name})
    handleClose()
  }

  return (
    <div>
      <Menu
        anchorEl={props.anchorEl}
        open={Boolean(props.anchorEl) && (props.anchorName == props.name)}
        onClose={handleClose}
        anchorOrigin={{horizontal: 'left', vertical: 'bottom'}}
        transformOrigin={{horizontal: 'left', vertical: 'top'}}
        getContentAnchorEl={null}
      >
        <MenuItem onClick={rename}>
          <ListItemIcon>
            <CreateIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Rename" />
        </MenuItem>
        <MenuItem onClick={handleDelete}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Close" />
        </MenuItem>
        <MenuItem button component="a"
                  href={`data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(props.sequence))}`}
                  download={`${props.name}.json`}
        >          <ListItemIcon>
            <SaveIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Save" />
        </MenuItem>
      </Menu>
    </div>
  );
}

function mapStateToProps(state, ownProps){
  return {sequence: state['sequences'][ownProps.name]
        }
}
export default connect(mapStateToProps)(TabMenu)
