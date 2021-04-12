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
import DACButton from './DACButton.jsx'
import NewChannelButton from './NewChannelButton.jsx'

function DACTable (props) {
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
          {Object.keys(props.channels).map(board => (
            <React.Fragment key={board}>
            {
            props.channels[board].map(ch => (
              <TableRow key={`${board}${ch}`}>
                <TableCell onContextMenu={(event) => props.onContextMenu(event, ch, 'DAC', board)}>
                  <Typography style={{ fontSize: 14 }}>
                    {props.aliases[board][ch]}
                  </Typography>
                </TableCell>
                {props.macrosequence.map((stage) => (
                  stage.sequence.map((step, index) => (
                      <DACButton timestep={index} ch={ch} key={'dac-' + board + ch + index} sequenceName={stage.name} board={board}/>

                  )
                  )

                ))}
              </TableRow>
            ))
          }

          <NewChannelButton channelType="DAC" board={board}/>
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

DACTable.propTypes = {
  dispatch: PropTypes.func,
  macrosequence: PropTypes.array,
  sequences: PropTypes.object,
  channels: PropTypes.object,
  aliases: PropTypes.object,
  expanded: PropTypes.bool,
  setExpanded: PropTypes.func,
  onContextMenu: PropTypes.func
}

function mapStateToProps (state, ownProps) {
  const macrosequence = [{ name: state.active_sequence, reps: 1, sequence: state.sequences[state.active_sequence].steps }]

  return {
    channels: state.ui.channels.DAC,
    macrosequence: macrosequence,
    sequences: state.sequences,
    aliases: state.aliases.DAC
  }
}
export default connect(mapStateToProps)(DACTable)
