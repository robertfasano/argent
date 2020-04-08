import React from 'react';
import {connect} from 'react-redux'
import Select from '@material-ui/core/Select';
import Box from '@material-ui/core/Box';
import Popover from '@material-ui/core/Popover';
import TextField from '@material-ui/core/TextField';
import MenuItem from '@material-ui/core/MenuItem';
import IconButton from '@material-ui/core/IconButton';
import FolderOpenIcon from '@material-ui/icons/FolderOpen';
import InputAdornment from '@material-ui/core/InputAdornment';
import FileDialog from './FileDialog.jsx'
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import {get, post} from './utilities.js'

function ConfigPopover(props) {
  const open = Boolean(props.anchorEl)

  function loadInitialConfig() {
    get('config', (result) => {
      updateSequencePath(result['sequence_library'])
      updateDeviceDBPath(result['device_db'])
      }
    )
  }

  React.useEffect(loadInitialConfig, [])

  function updateSequencePath(filename) {
    props.dispatch({type: 'config/sequence_library', value: filename})
  }

  function updateDeviceDBPath(filename) {
    props.dispatch({type: 'config/device_db', value: filename})

  }

  return (
    <Popover
      open={open}
      anchorEl={props.anchorEl}
      onClose={(event) => props.setAnchorEl(null)}
      anchorOrigin={{vertical: 'bottom', horizontal: 'right'}}
      transformOrigin={{vertical: 'top', horizontal: 'left'}}
    >
    <Box m={1}>
      <FileDialog label="Sequences path"
                  value={props.config.sequence_library}
                  setValue={updateSequencePath}/>
    </Box>
    <Box m={1}>
      <FileDialog label="device_db path"
                  value={props.config.device_db}
                  setValue={updateDeviceDBPath}/>
    </Box>
    </Popover>
  )
}

function mapStateToProps(state, ownProps){
  return {config: state['config']
        }
}
export default connect(mapStateToProps)(ConfigPopover)
