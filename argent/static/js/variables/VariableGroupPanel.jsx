import React from 'react'
import PropTypes from 'prop-types'
import TableCell from '@material-ui/core/TableCell'
import Paper from '@material-ui/core/Paper'
import TableRow from '@material-ui/core/TableRow'
import TextField from '@material-ui/core/TextField'
import { connect } from 'react-redux'
import { post } from '../utilities.js'
import Button from '@material-ui/core/Button'
import Box from '@material-ui/core/Box'
import Grid from '@material-ui/core/Grid'
import AddIcon from '@material-ui/icons/Add'
import SendIcon from '@material-ui/icons/Send'
import TableBody from '@material-ui/core/TableBody'
import TableHead from '@material-ui/core/TableHead'
import Table from '@material-ui/core/Table'
import Typography from '@material-ui/core/Typography'
import Divider from '@material-ui/core/Divider'
import IconButton from '@material-ui/core/IconButton'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import ExpandLessIcon from '@material-ui/icons/ExpandLess'
import ClearIcon from '@material-ui/icons/Clear'
import DebouncedTextField from '../components/DebouncedTextField.jsx'

function VariableGroupPanel (props) {
  const expanded = props.expanded.includes(props.group)

  function addVariable () {
    const name = prompt('New variable name:')
    if (name !== null) {
      props.updateVariable(name, '')
    }
  }

  function sendVariables () {
    post('/variables', props.variables)
  }

  function deleteGroup () {
    if (Object.keys(props.variables).length > 0) {
      alert('Cannot delete a non-empty group!')
    } else {
      props.deleteGroup()
    }
  }

  return (
    <Box pb={1}>
    <Paper elevation={6}>
    <Box px={2} pr={5}>
    <Grid container alignItems='center'>
        <Grid item xs={3}>
          <IconButton onClick={() => props.setExpanded(props.group)} >
          {expanded
            ? <ExpandLessIcon/>
            : <ExpandMoreIcon /> }
        </IconButton>
        </Grid>
        <Grid item xs={8}>
          <Typography style={{ fontSize: 20, color: 'black' }}> <b>{props.group}</b> </Typography>
        </Grid>
        <Grid item xs={1}>
          {(props.group !== 'default')
            ? (
              <IconButton onClick={deleteGroup} >
                <ClearIcon/>
              </IconButton>
              )
            : null}
        </Grid>
      </Grid>
    {expanded
      ? (
        <>
        <Divider/>
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
            {Object.entries(props.variables).sort().map(([key, value]) => (
                <TableRow key={key}>
                    <TableCell>
                    <TextField disabled value={key} onContextMenu={(event) => props.handleMenu(event, key)}/>
                    </TableCell>
                    <TableCell>
                    <DebouncedTextField value={value} onBlur={(value) => props.updateVariable(key, value)}/>
                    </TableCell>
                </TableRow>
            ))}
                <TableRow>
                <TableCell>
                    <Button onClick={addVariable} style={{ textTransform: 'none' }}>
                    <AddIcon/>
                    <Box px={2}>New</Box>
                    </Button>
                </TableCell>
                <TableCell>
                    <Button onClick={sendVariables} style={{ textTransform: 'none' }}>
                    <SendIcon/>
                    <Box px={2}>Send</Box>
                    </Button>
                </TableCell>
                </TableRow>
                </TableBody>
                </Table>
                </>
        )
      : null}

            </Box>
            </Paper>
            </Box>
  )
}
VariableGroupPanel.propTypes = {
  sequence: PropTypes.object,
  variables: PropTypes.object,
  updateVariable: PropTypes.func,
  name: PropTypes.string,
  items: PropTypes.array,
  handleMenu: PropTypes.func,
  group: PropTypes.string,
  expanded: PropTypes.array,
  setExpanded: PropTypes.func,
  deleteGroup: PropTypes.func
}

function mapDispatchToProps (dispatch, props) {
  return {
    updateVariable: (name, value) => dispatch({ type: 'variables/update', name: name, value: value, group: props.group }),
    deleteGroup: () => dispatch({ type: 'variables/deleteGroup', group: props.group })

  }
}

function mapStateToProps (state, props) {
  const variables = {}
  for (const name of props.items) {
    variables[name] = state.variables[name]
  }

  return {
    sequence: state.sequences[state.active_sequence],
    variables: variables
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(VariableGroupPanel)
