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
import PlayArrowIcon from '@material-ui/icons/PlayArrow'
import yaml from 'js-yaml'
import { connect } from 'react-redux'
import { v4 as uuidv4 } from 'uuid'
import { post } from './utilities.js'
import CodeIcon from '@material-ui/icons/Code'
import { merge } from 'lodash'

const flexContainer = {
  display: 'flex',
  flexDirection: 'row',
  padding: 0
}

const listItem = { width: 200 }

function SequenceToolbar (props) {
  // A context menu for the SequenceSelector allowing sequences to be renamed,
  // closed, or saved.
  const text = () => '# Created with Argent commit ' + props.version + '\n' + yaml.dump(props.steps)

  function submit (playlist) {
    const pid = uuidv4()
    post('/inputs', props.inputs)
    post('/submit', { playlist: playlist, pid: pid, inputs: props.inputs, outputs: props.outputs })
    props.setPID(pid)
  }

  function generate () {
    const pid = uuidv4()
    post('/generate', { playlist: props.sequence, pid: pid, inputs: props.inputs, outputs: props.outputs })
  }

  return (
    <List style={flexContainer}>
      <ListItem button onClick={() => submit(props.sequence)} style={listItem}>
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
                  href={`data:text/json;charset=utf-8,${encodeURIComponent(text())}`}
                  download={`${props.name}.yml`}
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

    </List>
  )
}

SequenceToolbar.propTypes = {
  name: PropTypes.string,
  sequence: PropTypes.array,
  steps: PropTypes.object,
  rename: PropTypes.func,
  delete: PropTypes.func,
  addToPlaylist: PropTypes.func,
  version: PropTypes.string,
  inputs: PropTypes.object,
  outputs: PropTypes.object,
  setPID: PropTypes.func
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

function mapStateToProps (state, props) {
  const steps = merge({}, state.sequences[state.active_sequence])
  const sequence = [{ name: state.active_sequence, reps: 1, sequence: steps }]

  steps.inputs = state.inputs
  steps.outputs = state.outputs
  return {
    sequence: sequence,
    version: state.version,
    inputs: state.inputs,
    outputs: state.outputs,
    steps: steps
  }
}
export default connect(mapStateToProps, mapDispatchToProps)(SequenceToolbar)
