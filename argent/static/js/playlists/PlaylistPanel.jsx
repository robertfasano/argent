import React from 'react'
import PropTypes from 'prop-types'
import Grid from '@material-ui/core/Grid'
import Box from '@material-ui/core/Box'
import IconButton from '@material-ui/core/IconButton'
import Typography from '@material-ui/core/Typography'
import { connect } from 'react-redux'
import SequenceCard from './SequenceCard.jsx'
import { post } from '../utilities.js'
import { v4 as uuidv4 } from 'uuid'
import { createSelector } from 'reselect'
import PlaylistPlayIcon from '@material-ui/icons/PlaylistPlay'

function PlaylistPanel (props) {
  function submit (playlist) {
    const pid = uuidv4()
    post('/variables', props.variables)
    post('/submit', { playlist: playlist, pid: pid, variables: props.variables, parameters: props.parameters })
    props.setPID(pid)
  }

  return (
  <Box p={2}>
      <Grid container>
        <Grid item xs={10}>
          <Typography style={{ fontSize: 24 }}> <b>Playlist</b> </Typography>
        </Grid>
        <Grid item xs={2}>
          <IconButton onClick={() => submit(props.playlist)}>
            <PlaylistPlayIcon />
          </IconButton>
        </Grid>
      </Grid>
      <Box my={2}>
        <Typography>Multiple sequences can be interleaved in a larger sequence using the "Add to playlist" option in the sequence editor.
        </Typography>
      </Box>
      {props.playlist.map((stage, index) => (
        <SequenceCard key={index} name={stage.name} index={index} length={props.playlist.length}/>
      )
      )}
  </Box>
  )
}

const getPlaylist = (playlist, sequences, state) => {
  const ms = []
  for (const index in playlist) {
    ms.push({ ...playlist[index], sequence: sequences[playlist[index].name] })
  }
  return ms
}

const selectPlaylist = createSelector(state => state.playlist,
  state => state.sequences,
  state => state,
  (playlist, sequences, state) => getPlaylist(playlist, sequences, state),
  { memoizeOptions: { resultEqualityCheck: (a, b) => a == b } }
)

PlaylistPanel.propTypes = {
  playlist: PropTypes.array,
  variables: PropTypes.object,
  parameters: PropTypes.object,
  setPID: PropTypes.func
}

function mapDispatchToProps (dispatch, props) {
  return {
    setPID: (pid) => {
      dispatch({ type: 'ui/pid', value: pid })
    }
  }
}

function mapStateToProps (state, props) {
  state = state.present
  return {
    variables: state.variables,
    parameters: state.parameters,
    playlist: selectPlaylist(state)
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(PlaylistPanel)
