import React from 'react';
import {connect} from 'react-redux'
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import Box from '@material-ui/core/Box';
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import SaveAltIcon from '@material-ui/icons/SaveAlt';
import Popover from '@material-ui/core/Popover';
import TextField from '@material-ui/core/TextField';
import ArrowRightAltIcon from '@material-ui/icons/ArrowRightAlt';

function SequenceSelector(props) {
  const [newName, setNewName] = React.useState('')
  const [anchorEl, setAnchorEl] = React.useState(null)
  const handleClick = event => {
    setAnchorEl(event.currentTarget)
  }
  const handleClose = () => {
    setAnchorEl(null)
  }
  const open = Boolean(anchorEl);

  return (
    <Box ml={10}>
    <Grid container spacing={1} alignItems="center">

      <Grid item xs={1}>
        <Select value={props.active_sequence}
                onChange={(event) => props.dispatch({type: 'sequence/retrieve',
                                                     name: event.target.value})}
        >
          {Object.keys(props.sequences).map(name => (
            <MenuItem key={name} value={name}>{name}</MenuItem>
          ))}
        </Select>
      </Grid>
      <Grid item xs={1}>
        <IconButton onClick={handleClick}>
          <SaveAltIcon />
        </IconButton>
      </Grid>
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{vertical: 'bottom', horizontal: 'center'}}
        transformOrigin={{vertical: 'top', horizontal: 'center'}}
      >
      <Box m={1}>
        <TextField onChange = {(event) => setNewName(event.target.value)}
                   value = {newName}
                   variant = "outlined"
                   size = "small"
                   label="Sequence name"
        />
        <IconButton onClick={() => props.dispatch({type: 'sequence/store', name: newName})}>
          <ArrowRightAltIcon />
        </IconButton>
      </Box>
      </Popover>
    </Grid>
    </Box>

  )
}

function mapStateToProps(state, ownProps){
  return {sequences: state['sequences'],
          active_sequence: state['active_sequence'],
          sequence: state['sequence']
        }
}
export default connect(mapStateToProps)(SequenceSelector)
