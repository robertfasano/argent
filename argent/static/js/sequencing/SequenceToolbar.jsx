import React from 'react'
import PropTypes from 'prop-types'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import ListItemText from '@material-ui/core/ListItemText'
import CreateIcon from '@material-ui/icons/Create'
import PlaylistPlayIcon from '@material-ui/icons/PlaylistPlay'
import DeleteIcon from '@material-ui/icons/Delete'
import SaveIcon from '@material-ui/icons/Save'
import NotesIcon from '@material-ui/icons/Notes'
import PlayArrowIcon from '@material-ui/icons/PlayArrow'
import yaml from 'js-yaml'
import { connect } from 'react-redux'
import { v4 as uuidv4 } from 'uuid'
import { post } from '../utilities.js'
import CodeIcon from '@material-ui/icons/Code'
import { merge } from 'lodash'
import { createSelector } from 'reselect'

const flexContainer = {
  display: 'flex',
  flexDirection: 'row',
  padding: 0
}

const listItem = { width: 200 }

function SequenceToolbar (props) {
  // A context menu for the SequenceSelector allowing sequences to be renamed,
  // closed, or saved.

  function submit (playlist) {
    const pid = uuidv4()
    post('/variables', props.variables)
    post('/submit', { playlist: playlist, pid: pid, variables: props.variables, parameters: props.parameters })
    props.setPID(pid)
  }

  function generate () {
    const pid = uuidv4()
    post('/generate', { playlist: props.playlist, pid: pid, variables: props.variables, parameters: props.parameters })
  }

  const onDownload = () => {
    const link = document.createElement('a')
    link.download = `${props.name}.yml`
    link.href = `data:text/json;charset=utf-8,${encodeURIComponent(props.text)}`
    link.click()
  }

  return (
    <List style={flexContainer}>
      <ListItem button onClick={() => submit(props.playlist)} style={listItem}>
        <ListItemIcon>
          <PlayArrowIcon/>
        </ListItemIcon>
        <ListItemText>Run</ListItemText>
      </ListItem>

      <ListItem button onClick={generate} style={listItem}>
      <ListItemIcon>
          <CodeIcon/>
        </ListItemIcon>
        <ListItemText>Generate</ListItemText>
      </ListItem>

      <ListItem button onClick={props.addToPlaylist} style={listItem}>
        <ListItemIcon>
          <PlaylistPlayIcon/>
        </ListItemIcon>
        <ListItemText>Add to playlist</ListItemText>
      </ListItem>

      <ListItem button onClick={props.rename} style={listItem}>
        <ListItemIcon>
          <CreateIcon/>
        </ListItemIcon>
        <ListItemText>Rename</ListItemText>
      </ListItem>

      <ListItem button component="a"
                onClick={onDownload}
                style={listItem}
      >
        <ListItemIcon>
          <SaveIcon/>
        </ListItemIcon>
        <ListItemText>Save</ListItemText>
      </ListItem>

      <ListItem button onClick={props.delete} style={listItem}>
        <ListItemIcon>
          <DeleteIcon fontSize="small"/>
        </ListItemIcon>
        <ListItemText>Close</ListItemText>
      </ListItem>

      <ListItem button onClick={(event) => props.setScriptAnchor(event.currentTarget)} style={listItem}>
        <ListItemIcon>
          <NotesIcon fontSize="small"/>
        </ListItemIcon>
        <ListItemText>Scripts</ListItemText>
      </ListItem>

    </List>
  )
}

SequenceToolbar.propTypes = {
  name: PropTypes.string,
  text: PropTypes.string,
  playlist: PropTypes.array,
  rename: PropTypes.func,
  delete: PropTypes.func,
  addToPlaylist: PropTypes.func,
  parameters: PropTypes.object,
  variables: PropTypes.object,
  setPID: PropTypes.func,
  setScriptAnchor: PropTypes.func
}

function mapDispatchToProps (dispatch, props) {
  return {
    rename: () => {
      const newName = prompt('Enter new sequence name:')
      dispatch({ type: 'sequence/rename', name: props.name, newName: newName })
    },
    delete: () => {
      dispatch({ type: 'sequence/close', name: props.name })
    },
    addToPlaylist: () => {
      dispatch({ type: 'playlist/append', sequence: { name: props.name, reps: 1 } })
    },
    setPID: (pid) => {
      dispatch({ type: 'ui/pid', value: pid })
    }
  }
}

const generateYAML = createSelector(
  state => state.sequences[state.active_sequence],
  state => state.variables,
  state => state.parameters,
  state => state.version,
  state => state.ui.groups,
  (sequence, variables, parameters, version, groups) => {
    const seq = merge({}, sequence)
    seq.variables = variables
    seq.parameters = parameters
    seq.ui = { groups: groups }
    return '# Created with Argent commit ' + version + '\n' + yaml.dump(seq)
  }
)

const selectPlaylist = createSelector(
  state => state.sequences,
  state => state.active_sequence,
  (sequences, name) => [{ name: name, reps: 1, sequence: sequences[name] }],
  { memoizeOptions: { resultEqualityCheck: (a, b) => a == b } }
)

function mapStateToProps (state, props) {
  return {
    playlist: selectPlaylist(state),
    variables: state.variables,
    parameters: state.parameters,
    text: generateYAML(state)
  }
}
export default connect(mapStateToProps, mapDispatchToProps)(SequenceToolbar)
