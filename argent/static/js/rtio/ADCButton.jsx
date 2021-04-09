import React from 'react'
import PropTypes from 'prop-types'
import Button from '@material-ui/core/Button'
import Popover from '@material-ui/core/Popover'
import TableCell from '@material-ui/core/TableCell'
import TableHead from '@material-ui/core/TableHead'
import TableBody from '@material-ui/core/TableBody'
import TableRow from '@material-ui/core/TableRow'
import Table from '@material-ui/core/Table'
import Box from '@material-ui/core/Box'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
import VariableUnitInput from '../components/VariableUnitInput.jsx'
import TextField from '@material-ui/core/TextField'
import ModeSelector from '../ModeSelector.jsx'
import Switch from '@material-ui/core/Switch'
import InputAdornment from '@material-ui/core/InputAdornment'
import { connect } from 'react-redux'
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import InputLabel from '@material-ui/core/InputLabel';
import FormHelperText from '@material-ui/core/FormHelperText';
import FormControl from '@material-ui/core/FormControl';
import ClearIcon from '@material-ui/icons/Clear';
import AddIcon from '@material-ui/icons/Add';

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

  const firstUnusedVariable = Object.keys(props.allOutputs).filter(name => !Object.keys(props.outputs).includes(name))[0]

  const handleContextMenu = (event) => {
    event.preventDefault()
    setAnchorEl(event.currentTarget)
  }

  return (
    <TableCell component="th" scope="row">
      <Button variant="contained"
              disableRipple={true}
              style={style}
              onContextMenu={handleContextMenu}
              onClick={props.toggle}
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
          <Typography style={{fontWeight: 'bold', fontSize: 24}}>
              ADC options
          </Typography>
          <Box m={1}>
          <Grid container spacing={2}>
            <Grid item xs={3}>
            <VariableUnitInput value={props.duration}
                               onChange={props.setDuration}
                               units = {['s', 'ms', 'us']}
                               label = 'Duration'
            />
            </Grid>
            <Grid item xs={3}>
            <TextField label='Samples'
                       value={props.samples}
                       onChange={props.setSamples}
                       InputLabelProps={{ shrink: true }}
            />
          </Grid>
          </Grid>
          </Box>

        </Box>
        <Box m={1} mx={2}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell> <Typography style={{fontWeight: "bold"}}> Variable </Typography> </TableCell>
                <TableCell> <Typography style={{fontWeight: "bold"}}> Channel </Typography> </TableCell>
                <TableCell> <Typography style={{fontWeight: "bold"}}> Operation </Typography> </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {Object.keys(props.outputs).map((name) => (
                <TableRow key={name}>
                  <TableCell>
                    <Select label="Variable"
                            value={name || ''}
                            onChange = {(event) => props.replaceOutput(name, event.target.value)}
                            style={{width: '100%'}}
                            >
                      <MenuItem value={''} key={''}>
                        {''}
                      </MenuItem>
                      {Object.keys(props.allOutputs).map((key, index) => (
                        <MenuItem value={key} key={key}>
                          {key}
                        </MenuItem>
                      ))}
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Select label="Channel"
                            value={props.outputs[name].ch}
                            onChange = {(event) => props.changeChannel(event, name)}
                            style={{width: '100%'}}
                            >
                      {[...Array(8).keys()].map((key, index) => (
                        <MenuItem value={key} key={key}>
                          {key}
                        </MenuItem>
                      ))}
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Select label="Operation"
                            value={props.outputs[name].operation}
                            onChange={(event) => props.updateOperation(event, name)}
                            style={{width: '100%'}}
                            >
                      {['mean', 'min', 'max', 'first', 'last'].map((key, index) => (
                        <MenuItem value={key} key={key}>
                          {key}
                        </MenuItem>
                      ))}
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Button onClick={() => props.removeOutput(name)}>
                      <ClearIcon/>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            }
            <TableRow>
              <TableCell>
                <Button onClick={() => props.newOutput(firstUnusedVariable, 0)}>
                  <AddIcon/>
                </Button>
              </TableCell>
            </TableRow>
            </TableBody>
          </Table>
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
  channel: PropTypes.object,
  changeChannel: PropTypes.func,
  newOutput: PropTypes.func
}

function mapDispatchToProps (dispatch, props) {
  const path = {
    sequenceName: props.sequenceName,
    board: props.board,
    timestep: props.timestep
  }

  return {

    newOutput: (variable, ch) => {
      dispatch({
        type: 'adc/outputs/add',
        value: variable,
        path: Object.assign(path, {ch: ch})
      })
    },

    removeOutput: (variable) => {
      dispatch({
        type: 'adc/outputs/remove',
        value: variable,
        path: Object.assign(path)
      })
    },

    replaceOutput: (oldOutput, newOutput) => {
      dispatch({
        type: 'adc/outputs/replace',
        oldOutput: oldOutput,
        newOutput: newOutput,
        path: Object.assign(path)
      })
    },

    changeChannel: (event, name) => dispatch({
      type: 'adc/outputs/changeChannel',
      value: name,
      path: Object.assign(path, {ch: event.target.value})
    }),

    updateOperation: (event, name) => dispatch({
      type: 'adc/outputs/operation',
      operation: event.target.value,
      variable: name,
      path: Object.assign(path)
    }),

    toggle: () => dispatch({
      type: 'adc/toggle',
      path: path
    }),

    setDelay: (value) => dispatch({
      type: 'adc/delay',
      value: value,
      path: path
    }),

    setDuration: (value) => dispatch({
      type: 'adc/duration',
      value: value,
      path: path
    }),

    setSamples: (event) => dispatch({
      type: 'adc/samples',
      value: event.target.value,
      path: path
    })
  }
}

function mapStateToProps (state, props) {
  const channel = state.sequences[props.sequenceName].steps[props.timestep].adc[props.board]
  return {
    enable: channel.enable,
    delay: channel.delay,
    channel: channel,
    outputs: channel.variables,
    allOutputs: state.sequences[props.sequenceName].outputs,
    samples: channel.samples || 1,
    duration: channel.duration || state.sequences[props.sequenceName].steps[props.timestep].duration
  }
}
export default connect(mapStateToProps, mapDispatchToProps)(ADCButton)