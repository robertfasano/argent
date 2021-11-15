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
      {Object.keys(props.channels).map(ch => (
        <React.Fragment key={ch + '-fragment'}>
          <TableRow>
            <TableCell>
              <Typography style={{ fontSize: 14 }}>
                {props.channels[ch]}
              </Typography>
            </TableCell>
            {
              props.steps.map((step, index) => (
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
  steps: PropTypes.array
}

function mapStateToProps (state, ownProps) {
  return {
    channels: state.channels.dds,
    steps: state.sequences[state.active_sequence].steps
  }
}
export default connect(mapStateToProps)(DDSTable)
