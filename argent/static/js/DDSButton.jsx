import React from 'react';
import Button from '@material-ui/core/Button';
import Popover from '@material-ui/core/Popover';
import TableCell from '@material-ui/core/TableCell';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import Grid from '@material-ui/core/Grid'
import Box from '@material-ui/core/Box'
import InputAdornment from '@material-ui/core/InputAdornment'
import Switch from '@material-ui/core/Switch';
import ScaledInput from './ScaledInput.jsx'
import FixedUnitInput from './FixedUnitInput.jsx'
import {connect} from 'react-redux'
import {actions} from './reducers/reducer.js'

function DDSButton(props) {
  const [anchorEl, setAnchorEl] = React.useState(null)
  const handleClick = event => {
    setAnchorEl(event.currentTarget)
  }
  const handleClose = () => {
    setAnchorEl(null)
  }
  const open = Boolean(anchorEl);

  function updateFrequency(value) {
    props.dispatch(actions.dds.frequency.update(props.timestep, props.channel, value))
  }

  function updateAttenuation(value) {
    props.dispatch(actions.dds.attenuation.update(props.timestep, props.channel, value))
  }

  function updateSwitch(event) {
    props.dispatch(actions.dds.toggle(props.timestep, props.channel))
  }

  return (
    <TableCell component="th" scope="row" key={props.timestep}>
      <Button variant="contained"
              disableRipple={true}
              style={{backgroundColor: props.on? '#ffff00': '#D3D3D3'}}
              onClick={(event) => handleClick(event)}
              >
        {''}
      </Button>
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
      >
      <Box m={1}>
        <Switch checked={props.on} onChange={updateSwitch}/>
      </Box>
      <Box m={1}>
        <ScaledInput value={props.frequency}
                       onChange = {updateFrequency}
                       units = {{'Hz': 1, 'kHz': 1e3, 'MHz': 1e6}}
                       label = 'Frequency'
                       variant = 'outlined'
                       size = 'small'
        />
      </Box>
      <Box m={1}>
        <FixedUnitInput value={props.attenuation}
                        onChange = {(event) => updateAttenuation(event.target.value)}
                        label = 'Attenuation'
                        unit = 'dB'
        />
      </Box>
      </Popover>
    </TableCell>
)
}


function mapStateToProps(state, ownProps){
  return {frequency: state['sequence'][ownProps.timestep]['dds'][ownProps.channel]['frequency'],
          attenuation: state['sequence'][ownProps.timestep]['dds'][ownProps.channel]['attenuation'],
          on: state['sequence'][ownProps.timestep]['dds'][ownProps.channel]['on']
        }
}
export default connect(mapStateToProps)(DDSButton)
