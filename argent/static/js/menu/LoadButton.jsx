import React from 'react'
import {connect} from 'react-redux'
import ListItem from '@material-ui/core/ListItem';
import FolderOpenIcon from '@material-ui/icons/FolderOpen';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';

function LoadButton(props) {

  const onInputClick = (event) => event.target.value = ''

  function loadFile(file) {
    const fileReader = new FileReader()
    fileReader.readAsText(file, 'UTF-8')
    const name = file.name.split('.json')[0]
    fileReader.onload = e => {
      props.dispatch({type: 'sequence/load', sequence: JSON.parse(e.target.result), name: name})
    }
  }

  function uploadState(e) {
    for (let file of e.target.files) {
      loadFile(file)
    }
  }

  return (
    <>
    <input
      accept="application/json"
      type="file"
      style={{display: 'none'}}
      onChange={uploadState}
      onClick={onInputClick}
      id="button-file"
      multiple
    />
    <label htmlFor="button-file">
    <ListItem button>
      <Box mr={1} mt={0.5}>
        <FolderOpenIcon/>
      </Box>
      <Typography>Load</Typography>

    </ListItem>
    </label>
    </>
  )
}

function mapStateToProps(state, ownProps){
  return {}
}

export default connect(mapStateToProps)(LoadButton)
