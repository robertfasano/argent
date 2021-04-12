import React from 'react'
import PropTypes from 'prop-types'
import TableCell from '@material-ui/core/TableCell'
import TableRow from '@material-ui/core/TableRow'
import Button from '@material-ui/core/Button'
import VariableUnitInput from '../components/VariableUnitInput.jsx'
import { connect } from 'react-redux'
import AddIcon from '@material-ui/icons/Add'

function TimestepTable (props) {
  function setDuration (timestep, duration, sequenceName) {
    props.dispatch({ type: 'timestep/duration', timestep: timestep, duration: duration, sequenceName: sequenceName })
  }

  function addTimestep () {
    props.dispatch({ type: 'timestep/insert', timestep: props.macrosequence[0].sequence.length-1, sequenceName: props.macrosequence[0].name })
  }

  return (
    <>
      <TableRow>
        <TableCell/>
        {
          props.macrosequence.map((stage) => (
            stage.sequence.map((step, index) => (
              <TableCell key={index} onContextMenu={(event) => props.onContextMenu(event, 'timestep' + index, index)}>
                <VariableUnitInput value={step.duration}
                                onChange = {(value) => setDuration(index, value, stage.name)}
                                units = {['s', 'ms', 'us']}
                />
              </TableCell>
            ))
          ))
        }
        <TableCell>
          <Button onClick={addTimestep}>
            <AddIcon/>
          </Button>
        </TableCell>
      </TableRow>
    </>
  )
}

TimestepTable.propTypes = {
  dispatch: PropTypes.func,
  macrosequence: PropTypes.array,
  onContextMenu: PropTypes.func
}

function mapStateToProps (state, ownProps) {
  const macrosequence = [{ name: state.active_sequence, reps: 1, sequence: state.sequences[state.active_sequence].steps }]
  return {
    macrosequence: macrosequence
  }
}
export default connect(mapStateToProps)(TimestepTable)
