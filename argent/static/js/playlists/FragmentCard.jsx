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
import { selectPresentState } from '../selectors'

function FragmentCard (props) {
  const handleContextMenu = (event) => {
    event.preventDefault()
    props.setMenuState({ anchor: event.currentTarget, fragment: props.index, stage: props.stageIndex })
  }

  return (
    <Box>
      <Paper elevation={4}>
        <Box mx={4} my={1}>
          <Grid container alignItems='center'>
            <Grid item xs={6}>
              <Typography style={{ fontSize: 18 }} onContextMenu={handleContextMenu}> <b> {props.name} </b> <br/> {props.duration} ms </Typography>

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

FragmentCard.propTypes = {
  name: PropTypes.string,
  index: PropTypes.number,
  remove: PropTypes.func,
  moveDown: PropTypes.func,
  moveUp: PropTypes.func,
  length: PropTypes.number,
  setMenuState: PropTypes.func,
  stageIndex: PropTypes.number,
  duration: PropTypes.number
}

function mapDispatchToProps (dispatch, props) {
  return {
    remove: () => {
      dispatch({ type: 'playlist/fragment/remove', fragment: props.index, stage: props.stageIndex })
    },
    moveDown: () => {
      dispatch({ type: 'playlist/fragment/swap', stage: props.stageIndex, a: props.index, b: props.index + 1 })
    },
    moveUp: () => {
      dispatch({ type: 'playlist/fragment/swap', stage: props.stageIndex, a: props.index, b: props.index - 1 })
    }
  }
}

function parseDuration (setpoint, variables) {
  if (setpoint.includes('self.')) return parseFloat(variables[setpoint.split('self.')[1]].value)
  else return parseFloat(setpoint)
}

function mapStateToProps (state, props) {
  state = selectPresentState(state)
  let duration = 0
  for (const step of state.sequences[props.name].steps) {
    duration = duration + parseDuration(step.duration, state.variables)
  }

  return {
    duration: duration
  }
}
export default connect(mapStateToProps, mapDispatchToProps)(FragmentCard)
