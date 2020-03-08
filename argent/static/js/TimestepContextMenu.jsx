import React from 'react';
import TableCell from '@material-ui/core/TableCell';
import IconButton from '@material-ui/core/IconButton';
import {connect} from 'react-redux'
import {actions} from './reducers/reducer.js'
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import MenuIcon from '@material-ui/icons/Menu';

function TimestepContextMenu(props) {
  const [visible, setVisible] = React.useState(false)
  const [open, setOpen] = React.useState(false)
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleClick = event => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  function moveLeft(index) {
    props.dispatch(actions.timing.moveLeft(index))
    setAnchorEl(null);
  }

  function moveRight(index) {
    props.dispatch(actions.timing.moveRight(index))
    setAnchorEl(null);
  }

  function insertTimestep(index) {
    props.dispatch(actions.timing.insert(index))
    setAnchorEl(null);
  }

  function deleteTimestep(index) {
    props.dispatch(actions.timing.delete(index))
    setAnchorEl(null);
  }
  return (
    <TableCell onMouseEnter={() => setVisible(true)}
               onMouseLeave={() => setVisible(false)}
               align="center"
    >
      {visible? (
        <IconButton onClick={handleClick} style={{padding: "0px"}}>
          <MenuIcon />
        </IconButton>

        ): null
      }
    <Menu
      anchorEl={anchorEl}
      keepMounted
      open={Boolean(anchorEl)}
      onClose={handleClose}
    >
      {props.index>0? <MenuItem onClick={() => moveLeft(props.index)}>Move left</MenuItem> : null}
      {props.index<props.length-1? <MenuItem onClick={() => moveRight(props.index)}>Move right</MenuItem> : null}
      <MenuItem onClick={() => insertTimestep(props.index-1)}>Insert left</MenuItem>
      <MenuItem onClick={() => insertTimestep(props.index)}>Insert right</MenuItem>
      {props.length>1? <MenuItem onClick={() => deleteTimestep(props.index)}>Delete</MenuItem> : null}
    </Menu>
  </TableCell>
  )
}

export default connect()(TimestepContextMenu)
