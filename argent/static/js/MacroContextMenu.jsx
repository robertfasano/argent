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

  function dispatch(type) {
    // send a store update and close the menu
    props.dispatch({type: type, timestep: props.timestep, sequence_name: props.sequence_name})
    setAnchorEl(null);
  }

  function moveLeft() {
    props.dispatch({type: 'macrosequence/swap', a: props.timestep, b: props.timestep-1, sequence_name: props.sequence_name})
    setAnchorEl(null);
  }

  function moveRight() {
    props.dispatch({type: 'macrosequence/swap', a: props.timestep, b: props.timestep+1, sequence_name: props.sequence_name})
    setAnchorEl(null);
  }

  function insertTimestep(timestep) {
    props.dispatch({type: 'macrosequence/insert', timestep: timestep, sequence_name: props.sequence_name})
    setAnchorEl(null);
  }

  function updateReps(index) {
    const reps = prompt('Enter number of repetitions:')
    props.dispatch({type: 'macrosequence/updateReps', index: index, reps: reps})
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
        <MenuItem onClick={() => dispatch('macrosequence/remove')}>
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
