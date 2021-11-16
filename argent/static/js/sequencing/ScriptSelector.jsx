import React from 'react'
import PropTypes from 'prop-types'
import Typography from '@material-ui/core/Typography'
import ClearIcon from '@material-ui/icons/Clear'
import FolderOpenIcon from '@material-ui/icons/FolderOpen'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import ListItemText from '@material-ui/core/ListItemText'
import { connect } from 'react-redux'

function ScriptSelector (props) {
  const scriptName = props.script || 'None'

  const onInputClick = (event) => { event.target.value = '' }

  function loadFile (file) {
    const fileReader = new FileReader()
    fileReader.readAsText(file, 'UTF-8')
    const name = file.name
    fileReader.onload = e => {
      props.updateScript(name)
    }
  }

  function uploadState (e) {
    for (const file of e.target.files) {
      loadFile(file)
    }
  }

  const label = (props.variant === 'analysis') ? 'Analysis script' : 'Preparation script'
  return (
    <List style={{
      display: 'flex',
      flexDirection: 'row',
      padding: 0
    }}>
        <ListItem>
        <Typography><b>{label}</b> {scriptName}</Typography>
        </ListItem>
        <ListItem button component="label">
            <input
                accept=".py"
                type="file"
                hidden
                onChange={uploadState}
                onClick={onInputClick}
            />
            <ListItemIcon>
                <FolderOpenIcon/>
            </ListItemIcon>
            <ListItemText>
                Upload script
            </ListItemText>
        </ListItem>

        <ListItem button onClick={() => props.updateScript(null)}>
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
  updateScript: PropTypes.func,
  variant: PropTypes.string
}

function mapDispatchToProps (dispatch, props) {
  return {
    updateScript: (name) => {
      dispatch({ type: 'sequence/script', name: name, variant: props.variant })
    }
  }
}

function mapStateToProps (state, props) {
  return {
    script: state.sequences[state.active_sequence].script[props.variant]
  }
}
export default connect(mapStateToProps, mapDispatchToProps)(ScriptSelector)
