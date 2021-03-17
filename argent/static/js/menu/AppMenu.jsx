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

function AppMenu (props) {
  const flexContainer = {
    display: 'flex',
    flexDirection: 'row',
    padding: 0
  }

  return (
    <React.Fragment>
      <List style={flexContainer}>
        <>
        <ListItem button onClick={() => post('/submit', props.macrosequence)}>
          <Box mr={1} mt={0.5}>
            <PlayArrowIcon/>
          </Box>
          <Typography>Run</Typography>
        </ListItem>
        <ListItem button onClick={() => post('/generate', props.macrosequence)}>
          <Box mr={1} mt={0.5}>
            <CodeIcon/>
          </Box>
          <Typography>Generate</Typography>
        </ListItem>
        </>
    </List>

    </React.Fragment>
  )
}

function mapStateToProps (state, ownProps) {
  // assemble macrosequence
  const inactiveTTLs = state.channels.TTL.filter(e => !state.ui.channels.TTL.includes(e))
  const inactiveDDS = state.channels.DDS.filter(e => !state.ui.channels.DDS.includes(e))
  const inactiveChannels =[...inactiveTTLs, ...inactiveDDS]

  const macrosequence = []

  if (ownProps.tableChoice === 'master') {
    for (const stage of state.macrosequence) {
      macrosequence.push({
        name: stage.name,
        reps: stage.reps,
        sequence: omitDeep(state.sequences[stage.name], ...inactiveChannels)
      })
    }
  } else {
    const sequence = omitDeep(state.sequences[state.active_sequence], ...inactiveChannels)
    macrosequence.push({ name: state.active_sequence, reps: 1, sequence: sequence })
  }

  return {
    sequence: state.sequences[state.active_sequence],
    macrosequence: macrosequence,
    channels: state.channels,
    ui: state.ui
  }
}

AppMenu.propTypes = {
  macrosequence: PropTypes.array
}

export default connect(mapStateToProps)(AppMenu)
