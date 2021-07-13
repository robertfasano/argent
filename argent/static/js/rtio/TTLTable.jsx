import React from 'react'
import PropTypes from 'prop-types'
import TableCell from '@material-ui/core/TableCell'
import TableRow from '@material-ui/core/TableRow'
import Typography from '@material-ui/core/Typography'
import IconButton from '@material-ui/core/IconButton'
import { connect } from 'react-redux'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import ExpandLessIcon from '@material-ui/icons/ExpandLess'
import TTLButton from './TTLButton.jsx'

function TTLTable (props) {
  return (

<>
  <TableRow>
    <TableCell>
      <IconButton onClick={props.setExpanded} >
        {props.expanded
          ? <ExpandLessIcon/>
          : <ExpandMoreIcon /> }
        <Typography style={{ fontSize: 24, color: 'black' }}> <b>TTL</b> </Typography>
      </IconButton>
    </TableCell>
  </TableRow>
  {props.expanded
    ? (
    <React.Fragment>
    {Object.keys(props.channels).map(i => (
      <TableRow key={i}>
        <TableCell style={{ width: '100px' }}>
          <Typography style={{ fontSize: 14 }}>
            {props.channels[i]}
          </Typography>
        </TableCell>
        {
            props.steps.map((step, index) => (
              <TTLButton timestep={index} channel={i} key={'ttl-' + i + index} on={step.ttl[i]}/>
            ))
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

TTLTable.propTypes = {
  dispatch: PropTypes.func,
  channels: PropTypes.object,
  steps: PropTypes.array,
  expanded: PropTypes.bool,
  setExpanded: PropTypes.func
}

function mapStateToProps (state, ownProps) {
  return {
    channels: state.channels.TTL,
    steps: state.sequences[state.active_sequence].steps
  }
}
export default connect(mapStateToProps)(TTLTable)
