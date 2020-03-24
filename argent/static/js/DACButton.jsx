import React from 'react';
import Button from '@material-ui/core/Button';
import Popover from '@material-ui/core/Popover';
import TableCell from '@material-ui/core/TableCell';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import Grid from '@material-ui/core/Grid'
import Box from '@material-ui/core/Box'
import ScaledInput from './ScaledInput.jsx'
import {gradient} from './colors.js'
import {connect} from 'react-redux'
import {actions} from './reducers/reducer.js'

function DACButton(props) {
  const [anchorEl, setAnchorEl] = React.useState(null)

  let color = "#D3D3D3"
  if (props.value < 0) {
    color = gradient('#D3D3D3', "#67001a", 0, 10, -props.value)
  }
  else if (props.value > 0) {
    color = gradient('#D3D3D3', "#004e67", 0, 10, props.value)
  }

  const handleClick = event => {
    setAnchorEl(event.currentTarget)
  }
  const handleClose = () => {
    setAnchorEl(null)
  }
  const open = Boolean(anchorEl);
  function updateValue(value) {
    props.dispatch(actions.dac.update(props.timestep, props.channel, value))
  }

  return (
    <TableCell component="th" scope="row" key={props.timestep}>
      <Button variant="contained"
              disableRipple={true}
              style={{backgroundColor: color}}
              onClick={(event) => handleClick(event)}
              >
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
        <ScaledInput value={props.value}
                       onChange = {updateValue}
                       units = {{'V': 1, 'mV': 1e-3, 'uV': 1e-6}}
                       label = 'Voltage'
                       variant = 'outlined'
        />
      </Box>
      </Popover>
    </TableCell>
)
}

function mapStateToProps(state, ownProps){
  return {value: state['sequence'][ownProps.timestep]['dac'][ownProps.channel],
          sequence: state['sequence']
        }
}
export default connect(mapStateToProps)(DACButton)
