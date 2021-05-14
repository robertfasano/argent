import React from 'react'
import PropTypes from 'prop-types'
import Paper from '@material-ui/core/Paper'
import IconButton from '@material-ui/core/IconButton'
import Typography from '@material-ui/core/Typography'
import Box from '@material-ui/core/Box'
import Grid from '@material-ui/core/Grid'
import { connect } from 'react-redux'
import ClearIcon from '@material-ui/icons/Clear'
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown'
import KeyboardArrowUpIcon from '@material-ui/icons/KeyboardArrowUp'

function SequenceCard (props) {
  return (
    <Box m={1}>
      <Paper>
        <Box mx={4} my={1}>
          <Grid container alignItems='center'>
            <Grid item xs={6}>
              <Typography style={{ fontSize: 18 }}> <b> {props.name} </b> </Typography>

            </Grid>
            <Grid item xs={2}>
                <IconButton onClick={props.moveUp} disabled={props.index === 0} >
                  <KeyboardArrowUpIcon fontSize="large"/>
                </IconButton>
            </Grid>
            <Grid item xs={2}>
                <IconButton onClick={props.moveDown} disabled={props.index === props.length - 1} >
                  <KeyboardArrowDownIcon fontSize="large"/>
                </IconButton>
            </Grid>
            <Grid item xs={2}>
              <IconButton onClick={props.remove} >
                <ClearIcon fontSize="large"/>
              </IconButton>
            </Grid>
          </Grid>

        </Box>
      </Paper>
    </Box>
  )
}

SequenceCard.propTypes = {
  name: PropTypes.string,
  index: PropTypes.number,
  remove: PropTypes.func,
  moveDown: PropTypes.func,
  moveUp: PropTypes.func,
  length: PropTypes.number
}

function mapDispatchToProps (dispatch, props) {
  return {
    remove: () => {
      dispatch({ type: 'macrosequence/remove', index: props.index })
    },
    moveDown: () => {
      dispatch({ type: 'macrosequence/swap', a: props.index, b: props.index + 1 })
    },
    moveUp: () => {
      dispatch({ type: 'macrosequence/swap', a: props.index, b: props.index - 1 })
    }
  }
}

function mapStateToProps (state, props) {
  return {
  }
}
export default connect(mapStateToProps, mapDispatchToProps)(SequenceCard)
