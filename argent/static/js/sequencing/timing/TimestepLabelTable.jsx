import React from 'react'
import PropTypes from 'prop-types'
import TableCell from '@material-ui/core/TableCell'
import TableRow from '@material-ui/core/TableRow'
import TimestepLabelField from './TimestepLabelField.jsx'
import { connect } from 'react-redux'

function TimestepLabelTable (props) {
  const disabled = false || props.disabled
  return (
    <>
      <TableRow>
        <TableCell/>
        {
            props.steps.map((step, index) => (
              <TableCell key={index}>
                <TimestepLabelField timestep={index} disabled={disabled}/>
              </TableCell>
            ))
        }
      </TableRow>
    </>
  )
}

TimestepLabelTable.propTypes = {
  dispatch: PropTypes.func,
  onContextMenu: PropTypes.func,
  steps: PropTypes.array,
  disabled: PropTypes.bool
}

function mapStateToProps (state, ownProps) {
  return {
    steps: state.sequences[state.active_sequence].steps
  }
}
export default connect(mapStateToProps)(TimestepLabelTable)
