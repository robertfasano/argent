import React from 'react'
import PropTypes from 'prop-types'
import PlayArrowIcon from '@material-ui/icons/PlayArrow'
import PlaylistPlayIcon from '@material-ui/icons/PlaylistPlay'
import Box from '@material-ui/core/Box'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import Typography from '@material-ui/core/Typography'
import CodeIcon from '@material-ui/icons/Code'
import { post, memoizeArray } from '../utilities.js'
import { connect } from 'react-redux'
import omitDeep from 'omit-deep-lodash'
import { v4 as uuidv4 } from 'uuid'
import { createSelector } from 'reselect'

function AppMenu (props) {
  const flexContainer = {
    display: 'flex',
    flexDirection: 'row',
    padding: 0
  }

  function submit (macrosequence) {
    const pid = uuidv4()
    post('/inputs', props.inputs)
    post('/submit', { macrosequence: macrosequence, pid: pid })
    props.dispatch({ type: 'ui/pid', value: pid })
  }

  function generate () {
    const pid = uuidv4()
    post('/generate', { macrosequence: props.sequence, pid: pid })
  }

  return (
    <React.Fragment>
      <List style={flexContainer}>
        <ListItem button onClick={() => submit(props.sequence)}>
          <Box mr={1} mt={0.5}>
            <PlayArrowIcon/>
          </Box>
          <Typography>Run</Typography>
        </ListItem>
        <ListItem button onClick={() => submit(props.macrosequence)}>
          <Box mr={1} mt={0.5}>
            <PlaylistPlayIcon/>
          </Box>
          <Typography>Run all</Typography>
        </ListItem>
        <ListItem button onClick={generate}>
          <Box mr={1} mt={0.5}>
            <CodeIcon/>
          </Box>
          <Typography>Generate</Typography>
        </ListItem>
    </List>

    </React.Fragment>
  )
}

function filterSequence (sequence, state) {
  // Remove all inactive channels from a sequence
  const inactiveTTLs = state.channels.TTL.filter(e => !state.ui.channels.TTL.includes(e))
  const inactiveDDS = state.channels.DDS.filter(e => !state.ui.channels.DDS.includes(e))
  let inactiveDACs = []
  for (const board of Object.keys(state.channels.DAC)) {
    inactiveDACs = [...inactiveDACs, ...state.channels.DAC[board].filter(e => !state.ui.channels.DAC[board].includes(e))]
  }
  const inactiveChannels = [...inactiveTTLs, ...inactiveDDS, ...inactiveDACs]
  return omitDeep(sequence, ...inactiveChannels)
}

const filterMacrosequence = (macrosequence, sequences, state) => {
  const ms = []
  for (const index in macrosequence) {
    ms.push({ ...macrosequence[index], sequence: filterSequence(sequences[macrosequence[index].name], state) })
  }
  return ms
}

const prepareMacrosequence = memoizeArray(
  (memArray) => createSelector(state => state.macrosequence,
    state => state.sequences,
    state => state,
    (macrosequence, sequences, state) => memArray(filterMacrosequence(macrosequence, sequences, state))
  )
)

function mapStateToProps (state, ownProps) {
  let sequence = filterSequence(state.sequences[state.active_sequence], state)
  sequence = [{ name: state.active_sequence, reps: 1, sequence: sequence }]
  const macrosequence = prepareMacrosequence(state)

  return {
    sequence: sequence,
    macrosequence: macrosequence,
    inputs: state.sequences[state.active_sequence].inputs
  }
}

AppMenu.propTypes = {
  sequence: PropTypes.object,
  macrosequence: PropTypes.array,
  inputs: PropTypes.object,
  dispatch: PropTypes.func
}

export default connect(mapStateToProps)(AppMenu)
