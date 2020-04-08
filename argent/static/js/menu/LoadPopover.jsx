import React from 'react';
import {connect} from 'react-redux'
import Select from '@material-ui/core/Select';
import Box from '@material-ui/core/Box';
import Popover from '@material-ui/core/Popover';
import MenuItem from '@material-ui/core/MenuItem';
import {post} from '../utilities.js'

function LoadPopover(props) {
  const open = Boolean(props.anchorEl)

  function loadSequence(name) {
    props.dispatch({type: 'sequence/retrieve', name: name})
    post('/variables', props.sequences[name].variables)
  }

  return (
    <Popover
      open={open}
      anchorEl={props.anchorEl}
      onClose={(event) => props.setAnchorEl(null)}
      anchorOrigin={{vertical: 'bottom', horizontal: 'left'}}
      transformOrigin={{vertical: 'top', horizontal: 'left'}}
    >
    <Box m={1}>
      <Select value={props.active_sequence}
              onChange={(event) => loadSequence(event.target.value)}
      >
        {Object.keys(props.sequences).map(name => (
          <MenuItem key={name} value={name}>{name}</MenuItem>
        ))}
      </Select>
    </Box>
    </Popover>
  )
}

function mapStateToProps(state, ownProps){
  return {sequences: state['sequences'],
          active_sequence: state['active_sequence'],
          sequence: state['sequence']
        }
}
export default connect(mapStateToProps)(LoadPopover)
