import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import ListItem from '@material-ui/core/ListItem'
import FolderOpenIcon from '@material-ui/icons/FolderOpen'

function LoadButton (props) {
  // Allows one or more sequences to be loaded from .json files into the
  // 'sequences' field of the Redux store.
  const onInputClick = (event) => { event.target.value = '' }

  function loadFile (file) {
    const fileReader = new FileReader()
    fileReader.readAsText(file, 'UTF-8')
    const name = file.name.split('.json')[0]
    fileReader.onload = e => {
      const sequence = JSON.parse(e.target.result)
      props.dispatch({ type: 'sequence/load', sequence: sequence, name: name })

      // update active channels
      for (const step of sequence) {
        for (const ch of Object.keys(step.ttl)) {
          if (!(props.channels.TTL.includes(ch))) {
            props.dispatch({ type: 'ui/setActive', channelType: 'TTL', channel: ch })
          }
        }
      }
    }
  }

  function uploadState (e) {
    for (const file of e.target.files) {
      loadFile(file)
    }
  }

  return (
    <>
    <input
      accept="application/json"
      type="file"
      style={{ display: 'none' }}
      onChange={uploadState}
      onClick={onInputClick}
      id="button-file"
      multiple
    />
    <label htmlFor="button-file">
    <ListItem button>
        <FolderOpenIcon/>
    </ListItem>
    </label>
    </>
  )
}

LoadButton.propTypes = {
  dispatch: PropTypes.func,
  channels: PropTypes.object
}

function mapStateToProps (state, ownProps) {
  return { channels: state.ui.channels }
}

export default connect(mapStateToProps)(LoadButton)
