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
import FragmentCard from './FragmentCard.jsx'
import { selectPresentState } from '../selectors.js'
import MergeIcon from '@mui/icons-material/Merge'

function StageCard (props) {
  return (
    <Box>
      <Paper elevation={4}>
        <Box mx={2} my={1} pt={1}>
          <Grid container alignItems='center'>
            <Grid item xs={4}>
              <Typography style={{ fontSize: 18 }}> <b> - Stage {props.index}  </b> <br/> {props.duration} ms </Typography>

            </Grid>
            <Grid item xs={2}>
                <IconButton onClick={props.merge} disabled={false} >
                  <MergeIcon fontSize="large"/>
                </IconButton>
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

          <Box pb={1}>
          {props.fragments.map((stage, index) => (
            <FragmentCard key={index}
                          name={stage.name}
                          index={index}
                          stageIndex={props.index}
                          length={props.fragments.length}
                          setMenuState={props.setMenuState}
                          />
          )
          )}
          </Box>

        </Box>
      </Paper>
    </Box>
  )
}

StageCard.propTypes = {
  name: PropTypes.string,
  index: PropTypes.number,
  remove: PropTypes.func,
  moveDown: PropTypes.func,
  moveUp: PropTypes.func,
  length: PropTypes.number,
  fragments: PropTypes.array,
  setMenuState: PropTypes.func,
  merge: PropTypes.func,
  duration: PropTypes.number
}

function mapDispatchToProps (dispatch, props) {
  return {
    remove: () => {
      dispatch({ type: 'playlist/remove', index: props.index })
    },
    merge: () => {
      const sequenceName = prompt('Enter new sequence name:')
      dispatch({ type: 'playlist/merge', name: sequenceName, stage: props.index })
    },
    moveDown: () => {
      dispatch({ type: 'playlist/swap', a: props.index, b: props.index + 1 })
    },
    moveUp: () => {
      dispatch({ type: 'playlist/swap', a: props.index, b: props.index - 1 })
    }
  }
}

function parseDuration (setpoint, variables) {
  if (setpoint.includes('self.')) return parseFloat(variables[setpoint.split('self.')[1]])
  else return parseFloat(setpoint)
}

function mapStateToProps (state, props) {
  state = selectPresentState(state)
  const fragments = state.playlist[props.index].fragments
  let duration = 0
  for (const fragment of fragments) {
    for (const step of state.sequences[fragment.name].steps) {
      duration = duration + parseDuration(step.duration, state.variables)
    }
  }

  return {
    fragments,
    duration
  }
}
export default connect(mapStateToProps, mapDispatchToProps)(StageCard)
