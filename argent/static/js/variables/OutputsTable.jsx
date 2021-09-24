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
import Button from '@material-ui/core/Button'
import AddIcon from '@material-ui/icons/Add'
import ClearIcon from '@material-ui/icons/Clear'

function OutputsTable (props) {
  function addOutput () {
    const name = prompt('New variable name:')
    if (name !== null) {
      props.updateOutput(name, '')
    }
  }

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

  function deleteOutput (name) {
    if (checkOutput(name)) {
      alert('Cannot delete a variable which is used in the sequence!')
      return
    }
    props.deleteOutput(name)
  }

  return (
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
                      <Button onClick={() => deleteOutput(key)} >
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
}

OutputsTable.propTypes = {
  sequence: PropTypes.object,
  outputs: PropTypes.object,
  deleteOutput: PropTypes.func,
  updateOutput: PropTypes.func
}

function mapDispatchToProps (dispatch, props) {
  return {
    updateOutput: (name, value) => dispatch({ type: 'variables/output/update', variables: Object.fromEntries([[name, value]]) }),
    deleteOutput: (name) => dispatch({ type: 'variables/output/delete', name: name })
  }
}

function mapStateToProps (state, props) {
  return {
    sequence: state.sequences[state.active_sequence],
    outputs: state.outputs
  }
}
export default connect(mapStateToProps, mapDispatchToProps)(OutputsTable)
