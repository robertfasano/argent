import React from 'react';
import {connect} from 'react-redux'
import Select from '@material-ui/core/Select';
import Box from '@material-ui/core/Box';
import Popover from '@material-ui/core/Popover';
import MenuItem from '@material-ui/core/MenuItem';
import TextField from '@material-ui/core/TextField';
import DoneIcon from '@material-ui/icons/Done';
import IconButton from '@material-ui/core/IconButton';

function SavePopover(props) {
  const open = Boolean(props.anchorEl)
  const [newName, setNewName] = React.useState('')

  function handleEvent(event) {
    props.dispatch({type: 'sequence/store', name: newName})
    props.setAnchorEl(null)
  }

  return (
    <Popover
      open={open}
      anchorEl={props.anchorEl}
      onClose={(event) => props.setAnchorEl(null)}
      anchorOrigin={{vertical: 'center', horizontal: 'right'}}
      transformOrigin={{vertical: 'center', horizontal: 'left'}}
    >
    <Box mt={1} ml={1}>
      <TextField onChange = {(event) => setNewName(event.target.value)}
                 value = {newName}
                 variant = "outlined"
                 size = "small"
                 label="Sequence name"
      />
      <IconButton onClick={handleEvent}>
        <DoneIcon />
      </IconButton>
    </Box>
    </Popover>
  )
}

export default connect()(SavePopover)
