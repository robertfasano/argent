import React from 'react';
import TableCell from '@material-ui/core/TableCell';
import IconButton from '@material-ui/core/IconButton';
import {connect} from 'react-redux'
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import MenuIcon from '@material-ui/icons/Menu';

function MacroContextMenu(props) {
  const [visible, setVisible] = React.useState(false)
  const [open, setOpen] = React.useState(false)
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleClick = event => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  function remove() {
    // send a store update and close the menu
    props.dispatch({type: 'macrosequence/remove', index: props.timestep, sequenceName: props.sequenceName})
    setAnchorEl(null);
  }

  function moveLeft() {
    props.dispatch({type: 'macrosequence/swap', a: props.timestep, b: props.timestep-1, sequenceName: props.sequenceName})
    setAnchorEl(null);
  }

  function moveRight() {
    props.dispatch({type: 'macrosequence/swap', a: props.timestep, b: props.timestep+1, sequenceName: props.sequenceName})
    setAnchorEl(null);
  }

  function insertTimestep(index) {
    props.dispatch({type: 'macrosequence/insert', timestep: index, sequenceName: props.sequenceName})
    setAnchorEl(null);
  }

  function updateReps() {
    const reps = prompt('Enter number of repetitions:')
    if (reps != '') {
      props.dispatch({type: 'macrosequence/updateReps', index: props.timestep, reps: reps})
    }
    setAnchorEl(null);

  }
  return (
    <TableCell onMouseEnter={() => setVisible(true)}
               onMouseLeave={() => setVisible(false)}
               align="center"
               colSpan={props.colSpan}
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
        <MenuItem onClick={() => remove()}>
          Delete
        </MenuItem> : null}
      <MenuItem onClick={() => updateReps(props.timestep)}>
        Repetitions
      </MenuItem>
    </Menu>
  </TableCell>
  )
}

export default connect()(MacroContextMenu)
