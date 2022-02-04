import React from 'react'
import PropTypes from 'prop-types'
import TableCell from '@material-ui/core/TableCell'
import TableRow from '@material-ui/core/TableRow'
import Typography from '@material-ui/core/Typography'
import IconButton from '@material-ui/core/IconButton'
import { connect } from 'react-redux'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import ExpandLessIcon from '@material-ui/icons/ExpandLess'
import DDSButton from './DDSButton.jsx'
import TimestepLabelTable from '../timing/TimestepLabelTable.jsx'
import { selectSequenceLength, selectPresentState } from '../../selectors'

function DDSTable (props) {
  return (
    <>
    <TableRow>
      <TableCell colSpan={9} align='left'>
        <IconButton onClick={props.setExpanded} color='default' >
          {props.expanded
            ? <ExpandLessIcon/>
            : <ExpandMoreIcon /> }
          <Typography style={{ fontSize: 24, color: 'black' }}> <b>DDS enable</b> </Typography>
        </IconButton>
      </TableCell>
    </TableRow>

    {props.expanded
      ? (
      <React.Fragment>
      <TimestepLabelTable disabled={true}/>
      {Object.keys(props.channels).map(ch => (
        <React.Fragment key={ch + '-fragment'}>
          <TableRow>
            <TableCell>
              <Typography style={{ fontSize: 14 }} noWrap={true}>
                {props.channels[ch]}
              </Typography>
            </TableCell>
            {
              [...Array(props.length).keys()].map((step, index) => (
                <DDSButton timestep={index} ch={ch} key={'dds-' + ch + index}/>
              )
              )

            }
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

DDSTable.propTypes = {
  dispatch: PropTypes.func,
  channels: PropTypes.object,
  expanded: PropTypes.bool,
  setExpanded: PropTypes.func,
  length: PropTypes.number
}

function mapStateToProps (state, ownProps) {
  state = selectPresentState(state)
  return {
    channels: state.channels.dds,
    length: selectSequenceLength(state)
  }
}
export default connect(mapStateToProps)(DDSTable)
