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
import Tabs from '@material-ui/core/Tabs'
import Tab from '@material-ui/core/Tab'

function VariableTable (props) {
  function addInput () {
    const name = prompt('New variable name:')
    if (name !== null) {
      props.updateInput(name, '')
    }
  }

  function addOutput () {
    const name = prompt('New variable name:')
    if (name !== null) {
      props.updateOutput(name, '')
    }
  }

  function deleteInput (name) {
    // if (checkInput(name)) {
    //   alert('Cannot delete a variable which is used in the sequence!')
    //   return
    // }
    props.deleteInput(name)
  }

  function deleteOutput (name) {
    if (checkOutput(name)) {
      alert('Cannot delete a variable which is used in the sequence!')
      return
    }
    props.deleteOutput(name)
  }

  function sendInputs () {
    post('/inputs', props.inputs)
  }

  // function checkInput (name) {
  //   // Return true if the variable is used in the sequence
  //   for (const step of props.sequence.steps) {
  //     for (let board of Object.keys(step.dac)) {
  //       for (let ch of Object.keys(step.dac[board])) {
  //         if (step.dac[board][ch].includes('Var')) {
  //           let varName = step.dac[board][ch].replace('Var(', '').replace(')', '')
  //           if (name === varName) {
  //             return true
  //           }
  //         }
  //       }
  //     }
  //   }
  //   return false
  // }

  function checkOutput (name) {
    // Return true if the variable is used in the sequence
    for (const step of props.sequence.steps) {
      for (const board of Object.keys(step.adc)) {
        if (Object.values(step.adc[board].variables || {}).includes(name)) {
          return true
        }
      }
    }
    return false
  }

  return (
    <>
    <Tabs value={props.variableTab} onChange={(event, newValue) => props.changeVariableTab(newValue)} variant="fullWidth">
      <Tab key="Inputs" label="Inputs" value="Inputs" style={{ textTransform: 'none' }}/>
      <Tab key="Outputs" label="Outputs" value="Outputs" style={{ textTransform: 'none' }}/>
    </Tabs>
    <Box m={2}>
        {props.variableTab === 'Outputs'
          ? (
            <>
            <Box my={2}>
              <Typography>Output variables are used to store values extracted from ADC measurements. During sequence playback, their values are broadcast to the Argent server at the end of each cycle.
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
                {Object.keys(props.outputs).sort(Intl.Collator().compare).map(key => (
                  <TableRow key={key}>
                    <TableCell>
                      <TextField disabled value={key}/>
                    </TableCell>
                    <TableCell>
                      <TextField disabled value={String(props.outputs[key]).substring(0, 5)}/>
                    </TableCell>
                    <TableCell>
                      <Button onClick={() => deleteOutput(key)}>
                        <ClearIcon/>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell>
                    <Button onClick={addOutput}>
                      <AddIcon/>
                    </Button>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
            </>
            )
          : (
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
                      <TextField disabled value={key} onChange={(event) => props.updateInput(key, event.target.value)} />
                    </TableCell>
                    <TableCell>
                      <TextField value={value} onChange={(event) => props.updateInput(key, event.target.value)} />
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

    </Box>
    </>
  )
}

VariableTable.propTypes = {
  sequence: PropTypes.object,
  inputs: PropTypes.object,
  updateInput: PropTypes.func,
  deleteInput: PropTypes.func,
  outputs: PropTypes.object,
  deleteOutput: PropTypes.func,
  updateOutput: PropTypes.func,
  variableTab: PropTypes.string,
  changeVariableTab: PropTypes.func
}

function mapDispatchToProps (dispatch, props) {
  return {
    updateInput: (name, value) => dispatch({ type: 'variables/input/update', name: name, value: value }),
    updateOutput: (name, value) => dispatch({ type: 'variables/output/update', variables: Object.fromEntries([[name, value]]) }),
    deleteInput: (name) => dispatch({ type: 'variables/input/delete', name: name }),
    deleteOutput: (name) => dispatch({ type: 'variables/output/delete', name: name }),
    changeVariableTab: (name) => dispatch({ type: 'ui/changeVariableTab', name: name })
  }
}
function mapStateToProps (state, props) {
  return {
    sequence: state.sequences[state.active_sequence],
    inputs: state.inputs,
    outputs: state.outputs,
    variableTab: state.ui.variableTab
  }
}
export default connect(mapStateToProps, mapDispatchToProps)(VariableTable)