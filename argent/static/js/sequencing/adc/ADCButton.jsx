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
import FixedUnitInput from '../../components/FixedUnitInput.jsx'
import TextField from '@material-ui/core/TextField'
import { connect, shallowEqual } from 'react-redux'
import { createSelector } from 'reselect'
import Select from '@material-ui/core/Select'
import MenuItem from '@material-ui/core/MenuItem'
import ClearIcon from '@material-ui/icons/Clear'
import AddIcon from '@material-ui/icons/Add'
import { selectTimestep, selectPresentState } from '../../selectors.js'

function ADCButton (props) {
  const [anchorEl, setAnchorEl] = React.useState(null)
  const open = Boolean(anchorEl)
  const color = props.enable ? '#67001a' : '#D3D3D3'
  const style = {
    background: `linear-gradient(90deg, ${color} 0%, ${color} 100%)`,
    color: 'white',
    fontSize: 10,
    textTransform: 'none',
    opacity: props.skip ? 0.25 : 1
  }

  const firstUnusedVariable = props.allVariables.filter(name => !Object.keys(props.variables).includes(name))[0]

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
        disableRestoreFocus={true}
      >
        <Box p={1}>
          <Typography style={{ fontWeight: 'bold', fontSize: 24 }}>
              ADC options
          </Typography>
          <Box m={1}>
          <Grid container spacing={2}>
            <Grid item xs={3}>
              <FixedUnitInput value={props.duration}
                      onChange={props.setDuration}
                      unit = 'ms'
                      label = 'Duration'
                      style={{ width: '100%' }}
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
                <TableCell> <Typography style={{ fontWeight: 'bold' }}> Variable </Typography> </TableCell>
                <TableCell> <Typography style={{ fontWeight: 'bold' }}> Channel </Typography> </TableCell>
                <TableCell> <Typography style={{ fontWeight: 'bold' }}> Operation </Typography> </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {Object.keys(props.variables).map((name) => (
                <TableRow key={name}>
                  <TableCell>
                    <Select label="Variable"
                            value={name || ''}
                            onChange = {(event) => props.replaceOutput(name, event.target.value)}
                            style={{ width: '100%' }}
                            >
                      <MenuItem value={''} key={''}>
                        {''}
                      </MenuItem>
                      {props.allVariables.map((key, index) => (
                        <MenuItem value={key} key={key}>
                          {key}
                        </MenuItem>
                      ))}
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Select label="Channel"
                            value={props.variables[name].ch}
                            onChange = {(event) => props.changeChannel(event, name)}
                            style={{ width: '100%' }}
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
                            value={props.variables[name].operation}
                            onChange={(event) => props.updateOperation(event, name)}
                            style={{ width: '100%' }}
                            >
                      {['mean', 'min', 'max', 'first', 'last', 'peak-peak'].map((key, index) => (
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
  toggle: PropTypes.func,
  changeChannel: PropTypes.func,
  newOutput: PropTypes.func,
  variables: PropTypes.object,
  allVariables: PropTypes.array,
  removeOutput: PropTypes.func,
  updateOperation: PropTypes.func,
  replaceOutput: PropTypes.func,
  duration: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  setDuration: PropTypes.func,
  samples: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  setSamples: PropTypes.func,
  skip: PropTypes.bool
}

function mapDispatchToProps (dispatch, props) {
  const path = {
    board: props.board,
    timestep: props.timestep
  }

  return {

    newOutput: (variable, ch) => {
      dispatch({
        type: 'adc/outputs/add',
        value: variable,
        path: Object.assign(path, { ch: ch })
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
      path: Object.assign(path, { ch: event.target.value })
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

const selectVariableNames = createSelector(state => state.variables,
  variables => Object.keys(variables),
  { memoizeOptions: { resultEqualityCheck: shallowEqual } }
)

function mapStateToProps (state, props) {
  state = selectPresentState(state)
  const timestep = selectTimestep(state, props.timestep)
  const channel = timestep.adc[props.board]
  return {
    enable: channel.enable,
    variables: channel.variables,
    allVariables: selectVariableNames(state),
    samples: channel.samples || 1,
    duration: channel.duration || timestep.duration,
    skip: timestep.skip || false
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(ADCButton)
