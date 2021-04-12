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
import TTLButton from './TTLButton.jsx'
import NewChannelButton from './NewChannelButton.jsx'

function TTLTable (props) {
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
          <Typography style={{ fontSize: 24 }}> <b>TTL</b> </Typography>
        </Grid>
      </Grid>
    </TableCell>
  </TableRow>
  {props.expanded
    ? (
    <React.Fragment>
    {props.channels.map(i => (
      <TableRow key={i}>
        <TableCell onContextMenu={(event) => props.onContextMenu(event, i, 'TTL')} style={{ width: '100px' }}>
          <Typography style={{ fontSize: 14 }}>
            {props.aliases[i]}
          </Typography>
        </TableCell>
        {
          props.macrosequence.map((stage) => (
            stage.sequence.map((step, index) => (
              <TTLButton timestep={index} channel={i} key={'ttl-' + i + index} on={step.ttl[i]} sequenceName={stage.name}/>
            ))
          ))
        }
      </TableRow>
    ))}
    <NewChannelButton channelType="TTL"/>
    </React.Fragment>
      )
    : null
}
</>
  )
}

TTLTable.propTypes = {
  dispatch: PropTypes.func,
  channels: PropTypes.array,
  macrosequence: PropTypes.array,
  aliases: PropTypes.object,
  expanded: PropTypes.bool,
  setExpanded: PropTypes.func,
  onContextMenu: PropTypes.func
}

function mapStateToProps (state, ownProps) {
  const macrosequence = [{ name: state.active_sequence, reps: 1, sequence: state.sequences[state.active_sequence].steps }]

  return {
    channels: state.ui.channels.TTL,
    macrosequence: macrosequence,
    aliases: state.aliases.TTL
  }
}
export default connect(mapStateToProps)(TTLTable)
