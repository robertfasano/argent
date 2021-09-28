import React from 'react'
import PropTypes from 'prop-types'
import Box from '@material-ui/core/Box'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import TextField from '@material-ui/core/TextField'
import Typography from '@material-ui/core/Typography'
import { connect } from 'react-redux'
import { post } from '../utilities.js'
import Button from '@material-ui/core/Button'
import AddIcon from '@material-ui/icons/Add'
import ClearIcon from '@material-ui/icons/Clear'
import SendIcon from '@material-ui/icons/Send'

function InputsTable (props) {
  function addInput () {
    const name = prompt('New variable name:')
    if (name !== null) {
      props.updateInput(name, '')
    }
  }

  function deleteInput (name) {
    props.deleteInput(name)
  }

  function sendInputs () {
    post('/inputs', props.inputs)
  }

  function toDecimalString (num) {
    if (!num.includes('.')) {
      return num + '.0'
    }
    return num
  }

  return (
        <>
        <Box my={2}>
          <Typography>Input variables can be used to define a single value across multiple sequences for DAC voltages or DDS frequencies. During sequence playback,
            inputs are updated from the Argent server at the end of each cycle, allowing values to be changed while the sequence is running.
          </Typography>
        </Box>
        <Table>
          <colgroup>
            <col style={{ width: '90%' }}/>
            <col style={{ width: '10%' }}/>
          </colgroup>
          <TableHead>
            <TableRow>
              <TableCell> Name </TableCell>
              <TableCell> Value </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Object.entries(props.inputs).sort().map(([key, value]) => (
              <TableRow key={key}>
                <TableCell>
                  <TextField disabled value={key}/>
                </TableCell>
                <TableCell>
                  <TextField value={value} onChange={(event) => props.updateInput(key, event.target.value)} onBlur={() => props.updateInput(key, toDecimalString(value))} />
                </TableCell>
                <TableCell>
                  <Button onClick={() => deleteInput(key)}>
                    <ClearIcon/>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            <TableRow>
              <TableCell>
                <Button onClick={addInput}>
                  <AddIcon/>
                </Button>
              </TableCell>
              <TableCell>
                <Button onClick={sendInputs}>
                  <SendIcon/>
                </Button>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
        </>
  )
}

InputsTable.propTypes = {
  sequence: PropTypes.object,
  inputs: PropTypes.object,
  updateInput: PropTypes.func,
  deleteInput: PropTypes.func
}

function mapDispatchToProps (dispatch, props) {
  return {
    updateInput: (name, value) => dispatch({ type: 'variables/input/update', name: name, value: value }),
    deleteInput: (name) => dispatch({ type: 'variables/input/delete', name: name })
  }
}

function mapStateToProps (state, props) {
  return {
    sequence: state.sequences[state.active_sequence],
    inputs: state.inputs
  }
}
export default connect(mapStateToProps, mapDispatchToProps)(InputsTable)
