import React from 'react'
import PropTypes from 'prop-types'
import TableCell from '@material-ui/core/TableCell'
import Paper from '@material-ui/core/Paper'
import TableRow from '@material-ui/core/TableRow'
import { connect, shallowEqual } from 'react-redux'
import Button from '@material-ui/core/Button'
import Box from '@material-ui/core/Box'
import Grid from '@material-ui/core/Grid'
import AddIcon from '@material-ui/icons/Add'
import TableBody from '@material-ui/core/TableBody'
import TableHead from '@material-ui/core/TableHead'
import Table from '@material-ui/core/Table'
import Typography from '@material-ui/core/Typography'
import Divider from '@material-ui/core/Divider'
import IconButton from '@material-ui/core/IconButton'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import ExpandLessIcon from '@material-ui/icons/ExpandLess'
import ClearIcon from '@material-ui/icons/Clear'
import { createSelector } from 'reselect'
import { selectPresentState } from '../selectors.js'
import VariableRow from './VariableRow.jsx'
import VariableSyncButton from './VariableSyncButton.jsx'
import { arrayShallowEqual } from '../utilities.js'

function VariableGroupPanel (props) {
  const expanded = props.expanded.includes(props.group)
  function addVariable () {
    const name = prompt('New variable name:')
    if (name !== null) {
      props.updateVariable(name, '')
      props.changeGroup(name)
    }
  }

  function deleteGroup () {
    if (props.names.length > 0) {
      alert('Cannot delete a non-empty group!')
    } else {
      props.deleteGroup()
    }
  }

  return (
    <Box pb={1}>
    <Paper elevation={6}>
    <Box px={2} pr={1}>
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
            <col style={{ width: '50%' }}/>
            <col style={{ width: '20%' }}/>
            <col style={{ width: '20%' }}/>
            <col style={{ width: '10%' }}/>
            </colgroup>
            <TableHead>
            <TableRow>
                <TableCell> Name </TableCell>
                <TableCell> Default </TableCell>
                <TableCell> Value </TableCell>
                <TableCell> Sync </TableCell>
            </TableRow>
            </TableHead>
            <TableBody>
            {props.names.sort().map(key => (
                <VariableRow key={key} name={key} handleMenu={props.handleMenu}/>
            ))}
                <TableRow>
                <TableCell>
                    <Button onClick={addVariable} style={{ textTransform: 'none' }}>
                    <AddIcon/>
                    <Box px={2}>New</Box>
                    </Button>
                </TableCell>
                <TableCell>
                    <VariableSyncButton items={props.names}/>
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
  updateVariable: PropTypes.func,
  names: PropTypes.array,
  handleMenu: PropTypes.func,
  group: PropTypes.string,
  expanded: PropTypes.array,
  setExpanded: PropTypes.func,
  deleteGroup: PropTypes.func,
  currentVariables: PropTypes.object,
  syncVariable: PropTypes.func,
  changeGroup: PropTypes.func
}

function mapDispatchToProps (dispatch, props) {
  return {
    updateVariable: (name, value) => dispatch({ type: 'variables/update', name: name, value: value, group: props.group }),
    deleteGroup: () => dispatch({ type: 'variables/deleteGroup', group: props.group }),
    syncVariable: (name, value) => dispatch({ type: 'variables/sync', name: name, value: value }),
    changeGroup: (name) => dispatch({ type: 'variables/changeGroup', name: name, group: props.group })

  }
}

const selectVariableNames = () => createSelector(
  state => state.variables,
  (state, props) => props.group,
  (variables, group) => {
    const vars = []
    for (const name of Object.keys(variables)) {
      if (variables[name].group === group) vars.push(name)
    }
    return vars
  },
  { memoizeOptions: { resultEqualityCheck: arrayShallowEqual } }
)

const makeMapStateToProps = () => {
  const selectNames = selectVariableNames()
  const mapStateToProps = (state, props) => {
    state = selectPresentState(state)
    return {
      names: selectNames(state, props)
    }
  }
  return mapStateToProps
}

export default connect(makeMapStateToProps, mapDispatchToProps)(VariableGroupPanel)
