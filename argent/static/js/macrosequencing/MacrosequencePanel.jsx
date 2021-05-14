import React from 'react'
import PropTypes from 'prop-types'
import Paper from '@material-ui/core/Paper'
import Grid from '@material-ui/core/Grid'
import Box from '@material-ui/core/Box'
import Typography from '@material-ui/core/Typography'
import { connect } from 'react-redux'
import SequenceCard from './SequenceCard.jsx'

function MacrosequencePanel (props) {
  return (
    <Grid container item xs={12} spacing={2} justify='space-evenly'>
        <Paper style={{ minWidth: '350px' }} elevation={6}>
            <Box m={2}>
                <Typography style={{ fontSize: 24 }}> <b>Macrosequencing</b> </Typography>

                {props.macrosequence.map((stage, index) => (
                    <Grid item xs={12} key={index}>
                        <SequenceCard key={index} name={stage.name} index={index} length={props.macrosequence.length}/>
                    </Grid>
                )
                )}
            </Box>
        </Paper>
    </Grid>
  )
}

MacrosequencePanel.propTypes = {
  macrosequence: PropTypes.array
}

function mapDispatchToProps (dispatch, props) {
  return {
  }
}

function mapStateToProps (state, props) {
  return {
    macrosequence: state.macrosequence
  }
}
export default connect(mapStateToProps, mapDispatchToProps)(MacrosequencePanel)
