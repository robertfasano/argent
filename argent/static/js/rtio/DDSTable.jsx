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
import DDSButton from './DDSButton.jsx'
import NewChannelButton from './NewChannelButton.jsx'

function DDSTable (props) {
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
            <Typography style={{ fontSize: 24 }}> <b>DDS</b> </Typography>
          </Grid>
        </Grid>
      </TableCell>
    </TableRow>

    {props.expanded
      ? (
      <React.Fragment>
      {props.channels.map(ch => (
          <TableRow key={ch}>
            <TableCell onContextMenu={(event) => props.onContextMenu(event, ch, 'DDS')}>
              <Typography style={{ fontSize: 14 }}>
                {props.aliases[ch]}
              </Typography>
            </TableCell>
            {props.macrosequence.map((stage) => (
              stage.sequence.map((step, index) => (
                  <DDSButton timestep={index} ch={ch} key={'dds-' + ch + index} sequenceName={stage.name}/>
              )
              )

            ))}
          </TableRow>

      ))}
      <NewChannelButton channelType="DDS"/>
      </React.Fragment>
        )
      : null
}
    </>
  )
}

DDSTable.propTypes = {
  dispatch: PropTypes.func,
  macrosequence: PropTypes.array,
  sequences: PropTypes.object,
  channels: PropTypes.array,
  aliases: PropTypes.object,
  expanded: PropTypes.bool,
  setExpanded: PropTypes.func,
  onContextMenu: PropTypes.func
}

function mapStateToProps (state, ownProps) {
  const macrosequence = [{ name: state.active_sequence, reps: 1, sequence: state.sequences[state.active_sequence].steps }]

  return {
    channels: state.ui.channels.DDS,
    macrosequence: macrosequence,
    sequences: state.sequences,
    aliases: state.aliases.DDS
  }
}
export default connect(mapStateToProps)(DDSTable)
