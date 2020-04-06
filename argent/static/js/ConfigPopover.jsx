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

export default function ConfigPopover(props) {
  const open = Boolean(props.anchorEl)

  const [sequencePath, setSequencePath] = React.useState('')
  const [deviceDBPath, setDeviceDBPath] = React.useState('')

  get('config', (result) => setSequencePath(result['sequences_path']))
  get('config', (result) => setDeviceDBPath(result['device_db']))

  function updateSequencePath(filename) {
    post('config', {'sequences_path': filename}, (result) => setSequencePath(filename))
  }

  function updateDeviceDBPath(filename) {
    post('config', {'device_db': filename}, (result) => setDeviceDBPath(filename))
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
      <FileDialog label="Sequences path" value={sequencePath} setValue={updateSequencePath}/>
    </Box>
    <Box m={1}>
      <FileDialog label="device_db path" value={deviceDBPath} setValue={updateDeviceDBPath}/>
    </Box>
    </Popover>
  )
}
