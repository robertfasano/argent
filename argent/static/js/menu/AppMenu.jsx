import React from 'react'
import PropTypes from 'prop-types'
import PlayArrowIcon from '@material-ui/icons/PlayArrow'
import Box from '@material-ui/core/Box'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import Typography from '@material-ui/core/Typography'
import CodeIcon from '@material-ui/icons/Code'
import { post } from '../utilities.js'
import { connect } from 'react-redux'
import omitDeep from 'omit-deep-lodash'
import { v4 as uuidv4 } from 'uuid'

function AppMenu (props) {
  const flexContainer = {
    display: 'flex',
    flexDirection: 'row',
    padding: 0
  }

  function submit () {
    const pid = uuidv4()
    post('/inputs', props.inputs)
    post('/submit', { macrosequence: props.macrosequence, pid: pid })
    props.dispatch({ type: 'ui/pid', value: pid })
  }

  function generate () {
    const pid = uuidv4()
    post('/generate', { macrosequence: props.macrosequence, pid: pid })
  }

  return (
    <React.Fragment>
      <List style={flexContainer}>
        <ListItem button onClick={submit}>
          <Box mr={1} mt={0.5}>
            <PlayArrowIcon/>
          </Box>
          <Typography>Run</Typography>
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

function mapStateToProps (state, ownProps) {
  // assemble macrosequence
  const inactiveTTLs = state.channels.TTL.filter(e => !state.ui.channels.TTL.includes(e))
  const inactiveDDS = state.channels.DDS.filter(e => !state.ui.channels.DDS.includes(e))
  let inactiveDACs = []
  for (const board of Object.keys(state.channels.DAC)) {
    inactiveDACs = [...inactiveDACs, ...state.channels.DAC[board].filter(e => !state.ui.channels.DAC[board].includes(e))]
  }
  const inactiveChannels = [...inactiveTTLs, ...inactiveDDS, ...inactiveDACs]
  const sequence = omitDeep(state.sequences[state.active_sequence], ...inactiveChannels)
  const macrosequence = [{ name: state.active_sequence, reps: 1, sequence: sequence }]

  return {
    macrosequence: macrosequence,
    inputs: state.sequences[state.active_sequence].inputs
  }
}

AppMenu.propTypes = {
  macrosequence: PropTypes.array,
  inputs: PropTypes.object,
  dispatch: PropTypes.func
}

export default connect(mapStateToProps)(AppMenu)
