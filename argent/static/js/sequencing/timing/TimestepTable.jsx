import React from 'react'
import PropTypes from 'prop-types'
import TableCell from '@material-ui/core/TableCell'
import TableRow from '@material-ui/core/TableRow'
import Button from '@material-ui/core/Button'
import Duration from './Duration.jsx'
import { connect } from 'react-redux'
import AddIcon from '@material-ui/icons/Add'

function TimestepTable (props) {
  // A row of buttons representing the durations of all steps in the sequence
  function addTimestep () {
    props.dispatch({ type: 'timestep/insert', timestep: props.steps.length - 1 })
  }

  return (
    <>
      <TableRow>
        <TableCell/>
        {
            props.steps.map((step, index) => (
              <TableCell key={index} onContextMenu={(event) => props.onContextMenu(event, 'timestep' + index, index)}>
                <Duration timestep={index}/>
              </TableCell>
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
  onContextMenu: PropTypes.func,
  steps: PropTypes.array
}

function mapStateToProps (state, ownProps) {
  return {
    steps: state.sequences[state.active_sequence].steps
  }
}
export default connect(mapStateToProps)(TimestepTable)
