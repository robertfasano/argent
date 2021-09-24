import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import ListItem from '@material-ui/core/ListItem'
import FolderOpenIcon from '@material-ui/icons/FolderOpen'
import yaml from 'js-yaml'

function LoadButton (props) {
  // Allows one or more sequences to be loaded from .json files into the
  // 'sequences' field of the Redux store.
  const onInputClick = (event) => { event.target.value = '' }

  function loadFile (file) {
    const fileReader = new FileReader()
    fileReader.readAsText(file, 'UTF-8')
    const name = file.name.split('.yml')[0]
    fileReader.onload = e => {
      const sequence = yaml.load(e.target.result)
      props.dispatch({ type: 'sequence/load', sequence: sequence, name: name })
    }
  }

  function uploadState (e) {
    for (const file of e.target.files) {
      loadFile(file)
    }
  }

  return (
    <ListItem button component="label">
      <input
          accept=".yml"
          type="file"
          hidden
          onChange={uploadState}
          onClick={onInputClick}
          multiple
      />
        <FolderOpenIcon/>
    </ListItem>

  )
}

LoadButton.propTypes = {
  dispatch: PropTypes.func,
  channels: PropTypes.object
}

export default connect()(LoadButton)
