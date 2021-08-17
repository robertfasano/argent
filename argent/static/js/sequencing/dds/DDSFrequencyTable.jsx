import React from 'react'
import PropTypes from 'prop-types'
import TableCell from '@material-ui/core/TableCell'
import TableRow from '@material-ui/core/TableRow'
import Typography from '@material-ui/core/Typography'
import IconButton from '@material-ui/core/IconButton'
import { connect } from 'react-redux'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import ExpandLessIcon from '@material-ui/icons/ExpandLess'
import DDSFrequencyTimeline from './DDSFrequencyTimeline.jsx'

function DDSFrequencyTable (props) {
  return (
    <>
    <TableRow>
      <TableCell colSpan={9} align='left'>
        <IconButton onClick={props.setExpanded} color='default' >
          {props.expanded
            ? <ExpandLessIcon/>
            : <ExpandMoreIcon /> }
          <Typography style={{ fontSize: 24, color: 'black' }}> <b>DDS frequency</b> </Typography>
        </IconButton>
      </TableCell>
    </TableRow>

    {props.expanded
      ? (
      <React.Fragment>
      {Object.keys(props.channels).map(ch => (
        <React.Fragment key={ch + '-fragment'}>
          <TableRow>
            <TableCell>
              <Typography style={{ fontSize: 14 }}>
                {props.channels[ch]}
              </Typography>
            </TableCell>
              <DDSFrequencyTimeline ch={ch}/>
          </TableRow>
        </React.Fragment>
      ))}
      </React.Fragment>
        )
      : null
}
    </>
  )
}

DDSFrequencyTable.propTypes = {
  channels: PropTypes.object,
  expanded: PropTypes.bool,
  setExpanded: PropTypes.func
}

function mapStateToProps (state, ownProps) {
  return {
    channels: state.channels.DDS
  }
}
export default connect(mapStateToProps)(DDSFrequencyTable)
