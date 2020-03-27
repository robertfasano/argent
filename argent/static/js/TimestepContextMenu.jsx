import React from 'react';
import TableCell from '@material-ui/core/TableCell';
import IconButton from '@material-ui/core/IconButton';
import {connect} from 'react-redux'
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

  function dispatch(type) {
    // send a store update and close the menu
    props.dispatch({type: type, timestep: props.timestep})
    setAnchorEl(null);
  }

  function moveLeft() {
    props.dispatch({type: 'timestep/swap', a: props.timestep, b: props.timestep-1})
  }

  function moveRight() {
    props.dispatch({type: 'timestep/swap', a: props.timestep, b: props.timestep+1})
  }

  function insertTimestep(timestep) {
    props.dispatch({type: 'timestep/insert', timestep: timestep})
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
      {props.timestep>0?
        <MenuItem onClick={moveLeft}>
          Move left
        </MenuItem> : null}
      {props.timestep<props.length-1?
        <MenuItem onClick={moveRight}>
          Move right
        </MenuItem> : null}
      <MenuItem onClick={() => insertTimestep(props.timestep-1)}>
        Insert left
      </MenuItem>
      <MenuItem onClick={() => insertTimestep(props.timestep)}>
        Insert right
      </MenuItem>
      {props.length>1?
        <MenuItem onClick={() => dispatch('timestep/delete')}>
          Delete
        </MenuItem> : null}
    </Menu>
  </TableCell>
  )
}

export default connect()(TimestepContextMenu)
