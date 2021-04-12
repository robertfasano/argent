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

function ArgumentTable (props) {
  function addVariable () {
    const name = prompt('New variable name:')
    if (name !== null) {
      props.updateVariable(name, '')
    }
  }

  function deleteVariable (name) {
    // if (checkVariable(name)) {
    //   alert('Cannot delete a variable which is used in the sequence!')
    //   return
    // }
    props.deleteVariable(name)
  }

  // function checkVariable (name) {
  //   // Return true if the variable is used in the sequence
  //   for (const step of props.sequence.steps) {
  //     for (let board of Object.keys(step.dac)) {
  //       for (let ch of Object.keys(step.dac[board])) {
  //         if (step.dac[board][ch].includes('Var')) {
  //           let varName = step.dac[board][ch].replace('Arg(', '').replace(')', '')
  //           if (name === varName) {
  //             return true
  //           }
  //         }
  //       }
  //     }
  //   }
  //   return false
  // }

  return (
    <Box p={2}>
        <Typography style={{ fontSize: 24 }}> <b>Arguments</b> </Typography>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell> Name </TableCell>
              <TableCell> Value </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Object.entries(props.variables).map(([key, value]) => (
              <TableRow key={key}>
                <TableCell>
                  <TextField disabled value={key} onChange={(event) => props.updateVariable(key, event.target.value)} />
                </TableCell>
                <TableCell>
                  <TextField value={value} onChange={(event) => props.updateVariable(key, event.target.value)} />
                </TableCell>
                <TableCell>
                  <Button onClick={() => deleteVariable(key)}>
                    <ClearIcon/>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            <TableRow>
              <TableCell>
                <Button onClick={addVariable}>
                  <AddIcon/>
                </Button>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
    </Box>
  )
}

ArgumentTable.propTypes = {
  variables: PropTypes.object,
  updateVariable: PropTypes.func,
  deleteVariable: PropTypes.func
}

function mapDispatchToProps (dispatch, props) {
  return {
    updateVariable: (name, value) => dispatch({ type: 'arguments/update', name: name, value: value }),
    deleteVariable: (name) => dispatch({ type: 'arguments/delete', name: name })
  }
}
function mapStateToProps (state, props) {
  return {
    sequence: state.sequences[state.active_sequence],
    variables: state.sequences[state.active_sequence].arguments
  }
}
export default connect(mapStateToProps, mapDispatchToProps)(ArgumentTable)
