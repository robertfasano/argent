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
            [...Array(props.length).keys()].map((step, index) => (
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
  length: PropTypes.number,
  disabled: PropTypes.bool
}

function mapStateToProps (state, ownProps) {
  state = state.present
  return {
    length: state.sequences[state.active_sequence].steps.length
  }
}
export default connect(mapStateToProps)(TimestepLabelTable)
