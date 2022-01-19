import React from 'react'
import PropTypes from 'prop-types'
import TableCell from '@material-ui/core/TableCell'
import TableRow from '@material-ui/core/TableRow'
import Typography from '@material-ui/core/Typography'
import IconButton from '@material-ui/core/IconButton'
import { connect } from 'react-redux'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import ExpandLessIcon from '@material-ui/icons/ExpandLess'
import CameraButton from './CameraButton.jsx'
import { selectActiveSequence } from '../../selectors.js'

function CameraTable (props) {
  return (
    <>
    {/* Camera header */}
    <TableRow>
      <TableCell>
        <IconButton onClick={props.setExpanded} >
          {props.expanded
            ? <ExpandLessIcon/>
            : <ExpandMoreIcon /> }
          <Typography style={{ fontSize: 24, color: 'black' }}> <b>Camera</b> </Typography>
        </IconButton>
      </TableCell>
    </TableRow>

    {/* Camera buttons */}
    {props.expanded
      ? (
      <React.Fragment>
      {Object.keys(props.channels).map(board => (
          <TableRow key={`${board}`}>
            <TableCell>
              <Typography style={{ fontSize: 14 }}>
                {props.channels[board]}
              </Typography>
            </TableCell>
            {
              props.steps.map((step, index) => (
                  <CameraButton timestep={index} key={'camera-' + board + index} board={board}/>
              )
              )
            }
          </TableRow>

      ))}
      </React.Fragment>
        )
      : null
    }
    </>
  )
}

CameraTable.propTypes = {
  dispatch: PropTypes.func,
  steps: PropTypes.array,
  channels: PropTypes.object,
  expanded: PropTypes.bool,
  setExpanded: PropTypes.func
}

function mapStateToProps (state, ownProps) {
  state = state.present
  return {
    channels: state.channels.cam,
    steps: selectActiveSequence(state).steps
  }
}
export default connect(mapStateToProps)(CameraTable)
