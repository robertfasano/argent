import React from 'react'
import PropTypes from 'prop-types'
import Button from '@material-ui/core/Button'
import Popover from '@material-ui/core/Popover'
import TableCell from '@material-ui/core/TableCell'
import Box from '@material-ui/core/Box'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
import VariableUnitInput from '../components/VariableUnitInput.jsx'
import TextField from '@material-ui/core/TextField'
import ModeSelector from '../ModeSelector.jsx'
import Switch from '@material-ui/core/Switch'
import InputAdornment from '@material-ui/core/InputAdornment'
import { connect } from 'react-redux'

function ADCButton (props) {

  const [anchorEl, setAnchorEl] = React.useState(null)
  const open = Boolean(anchorEl)

  const color = props.enable? '#67001a' : '#D3D3D3'

  const style = {
    background: `linear-gradient(90deg, ${color} 0%, ${color} 100%)`,
    color: 'white',
    fontSize: 10,
    textTransform: 'none'
  }

  return (
    <TableCell component="th" scope="row">
      <Button variant="contained"
              disableRipple={true}
              style={style}
              onClick={(event) => setAnchorEl(event.currentTarget)}
              >
      </Button>
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={(event) => setAnchorEl(null)}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right'
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left'
        }}
      >
        <Box p={1}>
          <Box m={1}>
            <Switch checked={props.enable} onChange={props.toggle}/>
          </Box>
          <Box m={1}>
            <VariableUnitInput value={props.delay}
                               onChange = {props.setDelay}
                               units = {['s', 'ms', 'us']}
                               label = 'Delay'
            />
          </Box>
          <Typography component="div">
            <Box m={1} fontWeight="fontWeightBold" fontSize="h6.fontSize">
              Variables
            </Box>
          </Typography>
          {[...Array(8).keys()].map((ch) => (
            <Box m={1} key={ch}>
              <TextField value={props.channel.variables[ch] || ''}
                         onChange = {(event) => props.setVariable(event, ch)}
                         label = {'Channel ' + ch}
                         InputLabelProps={{ shrink: true }}
                         InputProps={{
                           endAdornment: <InputAdornment position="end">
                                          {Object.keys(props.variables).includes(props.channel.variables[ch])? '('+props.variables[props.channel.variables[ch]].substring(0, 5)+')' : '  '}
                                         </InputAdornment>
                         }}
              />

            </Box>
          ))}
        </Box>

      </Popover>
    </TableCell>
  )
}

ADCButton.propTypes = {
  enable: PropTypes.bool,
  delay: PropTypes.string,
  toggle: PropTypes.func,
  setDelay: PropTypes.func,
  channel: PropTypes.object
}

function mapDispatchToProps (dispatch, props) {
  const path = {
    sequenceName: props.sequenceName,
    board: props.board,
    timestep: props.timestep
  }

  return {
    setVariable: (event, ch) => dispatch({
      type: 'adc/variable',
      value: event.target.value,
      path: Object.assign(path, {ch: ch})
    }),

    toggle: () => dispatch({
      type: 'adc/toggle',
      path: path
    }),

    setDelay: (value) => dispatch({
      type: 'adc/delay',
      value: value,
      path: path
    })
  }
}

function mapStateToProps (state, props) {
  const channel = state.sequences[props.sequenceName][props.timestep].adc[props.board]
  return {
    enable: channel.enable,
    delay: channel.delay,
    channel: channel,
    variables: state.variables
  }
}
export default connect(mapStateToProps, mapDispatchToProps)(ADCButton)
