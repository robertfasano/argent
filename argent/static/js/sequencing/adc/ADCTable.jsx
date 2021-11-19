import React from 'react'
import PropTypes from 'prop-types'
import TableCell from '@material-ui/core/TableCell'
import TableRow from '@material-ui/core/TableRow'
import Typography from '@material-ui/core/Typography'
import IconButton from '@material-ui/core/IconButton'
import { connect } from 'react-redux'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import ExpandLessIcon from '@material-ui/icons/ExpandLess'
import ADCButton from './ADCButton.jsx'
import TimestepLabelTable from '../timing/TimestepLabelTable.jsx'

function ADCTable (props) {
  return (
    <>

    {/* ADC header */}
    <TableRow>
      <TableCell>
        <IconButton onClick={props.setExpanded} >
          {props.expanded
            ? <ExpandLessIcon/>
            : <ExpandMoreIcon /> }
          <Typography style={{ fontSize: 24, color: 'black' }}> <b>ADC</b> </Typography>
        </IconButton>
      </TableCell>
    </TableRow>

    {/* ADC buttons */}
    {props.expanded
      ? (
      <React.Fragment>
      <TimestepLabelTable disabled={true}/>
      {Object.keys(props.channels).map(board => (
          <TableRow key={`${board}`}>
            <TableCell>
              <Typography style={{ fontSize: 14 }}>
                {props.channels[board]}
              </Typography>
            </TableCell>
            {
              [...Array(props.length).keys()].map((index) => (
                  <ADCButton timestep={index} key={'adc-' + board + index} board={board}/>
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

ADCTable.propTypes = {
  dispatch: PropTypes.func,
  length: PropTypes.number,
  channels: PropTypes.object,
  expanded: PropTypes.bool,
  setExpanded: PropTypes.func
}

function mapStateToProps (state, ownProps) {
  return {
    channels: state.channels.adc,
    length: state.sequences[state.active_sequence].steps.length
  }
}
export default connect(mapStateToProps)(ADCTable)
