import React from 'react'
import PropTypes from 'prop-types'
import TableCell from '@material-ui/core/TableCell'
import Checkbox from '@material-ui/core/Checkbox'
import TableRow from '@material-ui/core/TableRow'
import TextField from '@material-ui/core/TextField'
import { connect, shallowEqual } from 'react-redux'
import DebouncedTextField from '../components/DebouncedTextField.jsx'
import { createSelector } from 'reselect'
import { selectPresentState } from '../selectors.js'

function VariableRow (props) {
  return (
    <TableRow key={props.name}>
        <TableCell>
        <TextField disabled value={props.name} onContextMenu={(event) => props.handleMenu(event, props.name)}/>
        </TableCell>
        <TableCell>
        <DebouncedTextField value={props.value.value} onBlur={(value) => props.updateVariable(props.name, value)}/>
        </TableCell>
        <TableCell>
        <TextField disabled value={props.value.current}/>
        </TableCell>
        <TableCell>
          <Checkbox checked={props.value.sync} onChange={(event) => props.syncVariable(props.name, event.target.checked)} />
        </TableCell>
    </TableRow>
  )
}

VariableRow.propTypes = {
  handleMenu: PropTypes.func,
  syncVariable: PropTypes.func,
  updateVariable: PropTypes.func,
  name: PropTypes.string,
  value: PropTypes.object

}

function mapDispatchToProps (dispatch, props) {
  return {
    updateVariable: (name, value) => dispatch({ type: 'variables/update', name: name, value: value, group: props.group }),
    deleteGroup: () => dispatch({ type: 'variables/deleteGroup', group: props.group }),
    syncVariable: (name, value) => dispatch({ type: 'variables/sync', name: name, value: value }),
    changeGroup: (name) => dispatch({ type: 'variables/changeGroup', name: name, group: props.group })

  }
}

const makeSelector = () => createSelector(
  state => state.variables,
  (state, props) => props.name,
  (variables, name) => variables[name],
  { memoizeOptions: { resultEqualityCheck: shallowEqual } }
)

const makeMapStateToProps = () => {
  const selectVariable = makeSelector()
  const mapStateToProps = (state, props) => {
    state = selectPresentState(state)
    return {
      value: selectVariable(state, props)
    }
  }
  return mapStateToProps
}

export default connect(makeMapStateToProps, mapDispatchToProps)(VariableRow)
