import React from 'react'
import PropTypes from 'prop-types'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
import Button from '@material-ui/core/Button'
import ClearIcon from '@material-ui/icons/Clear'
import FolderOpenIcon from '@material-ui/icons/FolderOpen'
import { connect } from 'react-redux'

import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import ListItemText from '@material-ui/core/ListItemText'

function ScriptSelector (props) {
  const scriptName = props.script || 'None'

  const onInputClick = (event) => { event.target.value = '' }

  function loadFile (file) {
    const fileReader = new FileReader()
    fileReader.readAsText(file, 'UTF-8')
    const name = file.name
    fileReader.onload = e => {
      props.dispatch({ type: 'sequence/script', name: name })
    }
  }

  function uploadState (e) {
    for (const file of e.target.files) {
      loadFile(file)
    }
  }

  function clearScript () {
    props.dispatch({ type: 'sequence/script', name: null })
  }

  return (
    <List style={{
      display: 'flex',
      flexDirection: 'row',
      padding: 0
    }}>
        <ListItem>
        <Typography><b>Analysis script:</b> {scriptName}</Typography>
        </ListItem>
        <ListItem>
            <input
                accept=".py"
                type="file"
                style={{ display: 'none' }}
                onChange={uploadState}
                onClick={onInputClick}
                id="script-upload"
                multiple
            />
            <label htmlFor="script-upload">
                <ListItem button>
                    <ListItemIcon>
                        <FolderOpenIcon/>
                    </ListItemIcon>
                    <ListItemText>
                        Upload script
                    </ListItemText>
                </ListItem>
            </label>

        </ListItem>

        <ListItem button onClick={clearScript}>
                    <ListItemIcon>
                        <ClearIcon/>
                    </ListItemIcon>
                    <ListItemText>
                        Clear script
                    </ListItemText>
                </ListItem>
    </List>
  )
}

ScriptSelector.propTypes = {
  script: PropTypes.string,
  dispatch: PropTypes.func
}

function mapStateToProps (state) {
  return {
    script: state.sequences[state.active_sequence].script
  }
}
export default connect(mapStateToProps)(ScriptSelector)
