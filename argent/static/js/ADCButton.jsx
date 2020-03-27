import React from 'react';
import Button from '@material-ui/core/Button';
import Popover from '@material-ui/core/Popover';
import TableCell from '@material-ui/core/TableCell';
import TextField from '@material-ui/core/TextField';
import Grid from '@material-ui/core/Grid'
import Box from '@material-ui/core/Box'
import Switch from '@material-ui/core/Switch';
import {connect} from 'react-redux'

function ADCButton(props) {
  const [anchorEl, setAnchorEl] = React.useState(null)
  const open = Boolean(anchorEl);

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

  return (
    <TableCell component="th" scope="row" key={props.timestep}>
      <Button variant="contained"
              disableRipple={true}
              style={{backgroundColor: props.on? '#ffff00': '#D3D3D3'}}
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
      </Popover>
    </TableCell>
)}

function mapStateToProps(state, ownProps){
  return {samples: state['sequence'][ownProps.timestep]['adc'][ownProps.channel]['samples'],
          on: state['sequence'][ownProps.timestep]['adc'][ownProps.channel]['on'],
          duration: state['sequence'][ownProps.timestep]['duration']
        }
}
export default connect(mapStateToProps)(ADCButton)
