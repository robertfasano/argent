import React from 'react'
import PropTypes from 'prop-types'
import TableCell from '@material-ui/core/TableCell'
import TableRow from '@material-ui/core/TableRow'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
import IconButton from '@material-ui/core/IconButton'
import { connect } from 'react-redux'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import ExpandLessIcon from '@material-ui/icons/ExpandLess'
import DACTimeline from './DACTimeline.jsx'
import TimestepLabelTable from '../timing/TimestepLabelTable.jsx'
import { selectPresentState } from '../../selectors'

function DACTimelines (props) {
  return (
    <>
        <TableRow>
          <TableCell>
            <Grid container>
              <Grid item xs={6}>
                <IconButton onClick={props.setExpanded} >
                  {props.expanded
                    ? <ExpandLessIcon/>
                    : <ExpandMoreIcon /> }
                </IconButton>
              </Grid>
              <Grid container item xs={6} alignItems='center'>
                <Typography style={{ fontSize: 24 }}> <b>DAC</b> </Typography>
              </Grid>
            </Grid>
          </TableCell>
        </TableRow>

        {/* DAC buttons */}
        {props.expanded
          ? (
          <React.Fragment>
          <TimestepLabelTable disabled={true}/>
          {Object.keys(props.channels).map(board => (
            <React.Fragment key={board}>
            {
            Object.keys(props.channels[board]).map(ch => (
              <TableRow key={`${board}${ch}`}>
                <TableCell>
                  <Typography style={{ fontSize: 14 }}>
                    {props.channels[board][ch]}
                  </Typography>
                </TableCell>
                <DACTimeline board={board} ch={ch}/>
              </TableRow>
            ))
          }

          </React.Fragment>

          )

          )}
          </React.Fragment>
            )
          : null
    }
    </>
  )
}

DACTimelines.propTypes = {
  dispatch: PropTypes.func,
  channels: PropTypes.object,
  expanded: PropTypes.bool,
  setExpanded: PropTypes.func
}

function mapStateToProps (state, ownProps) {
  state = selectPresentState(state)
  return {
    channels: state.channels.dac
  }
}
export default connect(mapStateToProps)(DACTimelines)
