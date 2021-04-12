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
import ADCButton from './ADCButton.jsx'

function ADCTable (props) {
  return (
    <>

    {/* ADC header */}
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
            <Typography style={{ fontSize: 24 }}> <b>ADC</b> </Typography>
          </Grid>
        </Grid>
      </TableCell>
    </TableRow>

    {/* ADC buttons */}
    {props.expanded
      ? (
      <React.Fragment>
      {props.channels.map(board => (
          <TableRow key={`${board}`}>
            <TableCell>
              <Typography style={{ fontSize: 14 }}>
                {board}
              </Typography>
            </TableCell>
            {props.macrosequence.map((stage) => (
              stage.sequence.map((step, index) => (
                  <ADCButton timestep={index} key={'adc-' + board + index} sequenceName={stage.name} board={board}/>
              )
              )

            ))}
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
  macrosequence: PropTypes.array,
  sequences: PropTypes.object,
  channels: PropTypes.array,
  expanded: PropTypes.bool,
  setExpanded: PropTypes.func
}

function mapStateToProps (state, ownProps) {
  const macrosequence = [{ name: state.active_sequence, reps: 1, sequence: state.sequences[state.active_sequence].steps }]

  return {
    channels: state.ui.channels.ADC,
    macrosequence: macrosequence,
    sequences: state.sequences
  }
}
export default connect(mapStateToProps)(ADCTable)
