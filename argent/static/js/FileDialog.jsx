import React from 'react';
import TextField from '@material-ui/core/TextField';
import IconButton from '@material-ui/core/IconButton';
import FolderOpenIcon from '@material-ui/icons/FolderOpen';
import InputAdornment from '@material-ui/core/InputAdornment';


export default function FileDialog(props) {


  function selectFile(filename) {
    filename = filename.split('C:\\fakepath\\').splice(-1)[0]
    props.setValue(filename)
  }

  return (
    <TextField variant = "outlined"
               value = {props.value}
               size = "small"
               label={props.label}
               InputLabelProps={{ shrink: true }}
               InputProps={{
                 endAdornment: <InputAdornment position="end">
                                 <input
                                   style={{display: 'none'}}
                                   id="contained-button-file"
                                   type="file"
                                   onChange={(event) => selectFile(event.target.value)}
                                 />
                                  <label htmlFor="contained-button-file">
                                    <IconButton component='span'>
                                      <FolderOpenIcon />
                                    </IconButton>
                                  </label>
                               </InputAdornment>
               }}
    />
  )
}
