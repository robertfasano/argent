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
import TimestepLabelTable from '../timing/TimestepLabelTable.jsx'
import { selectSequenceLength, selectPresentState } from '../../selectors'

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
    <TimestepLabelTable disabled={true}/>
    {Object.keys(props.channels).map(i => (
      <TableRow key={i}>
        <TableCell style={{ width: '100px' }}>
          <Typography style={{ fontSize: 14 }} noWrap={true}>
            {props.channels[i]}
          </Typography>
        </TableCell>
        {
            [...Array(props.length).keys()].map((index) => (
              <TTLButton timestep={index} channel={i} key={'ttl-' + i + index}/>
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
  length: PropTypes.number,
  expanded: PropTypes.bool,
  setExpanded: PropTypes.func
}

function mapStateToProps (state) {
  state = selectPresentState(state)
  return {
    channels: state.channels.ttl,
    length: selectSequenceLength(state)
  }
}
export default connect(mapStateToProps)(TTLTable)
