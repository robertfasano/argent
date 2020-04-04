import React from 'react';
import Button from '@material-ui/core/Button';
import Popover from '@material-ui/core/Popover';
import TableCell from '@material-ui/core/TableCell';
import TextField from '@material-ui/core/TextField';
import Grid from '@material-ui/core/Grid'
import Box from '@material-ui/core/Box'
import Switch from '@material-ui/core/Switch';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';

import {connect} from 'react-redux'


import FormLabel from '@material-ui/core/FormLabel';
import FormControl from '@material-ui/core/FormControl';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormHelperText from '@material-ui/core/FormHelperText';


function ADCButton(props) {
  const [anchorEl, setAnchorEl] = React.useState(null)
  const open = Boolean(Boolean(anchorEl) & Boolean(!props.reserved));

  function toggleOn(event) {
    props.dispatch({type: 'adc/toggle',
                    timestep: props.timestep,
                    channel: props.channel})
  }

  function updateSamples(value) {
    props.dispatch({type: 'adc/samples',
                    timestep: props.timestep,
                    channel: props.channel,
                    value: value})
  }

  function updateVariable(value) {
    props.dispatch({type: 'adc/variable',
                    timestep: props.timestep,
                    channel: props.channel,
                    value: value})
  }

  return (
    <TableCell component="th" scope="row" key={props.timestep}>
      <Button variant="contained"
              disableRipple={true}
              style={{backgroundColor: props.on? '#ffff00': '#D3D3D3', opacity: props.reserved? 0.15: 1}}
              onClick={(event) => setAnchorEl(event.currentTarget)}
              >
        {''}
      </Button>
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{vertical: 'bottom', horizontal: 'center'}}
        transformOrigin={{vertical: 'top', horizontal: 'center'}}
      >
        <Box m={1}>
          <Switch checked={props.on} onChange={toggleOn}/>
        </Box>

        <Box m={1}>
          <TextField onChange = {(event) => updateSamples(event.target.value)}
                     value = {props.samples}
                     variant = "outlined"
                     size = "small"
                     label="Samples"
          />
        </Box>

        <Box m={1}>
          <TextField onChange = {(event) => updateVariable(event.target.value)}
                     value = {props.variable}
                     variant = "outlined"
                     size = "small"
                     label="Variable"
          />
        </Box>

      </Popover>
    </TableCell>
)}

function mapStateToProps(state, ownProps){
  return {samples: state['sequence']['adc'][ownProps.channel][ownProps.timestep]['samples'],
          on: state['sequence']['adc'][ownProps.channel][ownProps.timestep]['on'],
          variable: state['sequence']['adc'][ownProps.channel][ownProps.timestep]['variable'],
          reserved: state['sequence']['adc'][ownProps.channel][ownProps.timestep]['reserved']
        }
}
export default connect(mapStateToProps)(ADCButton)
