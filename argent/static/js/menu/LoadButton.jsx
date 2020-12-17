import React from 'react'
import {connect} from 'react-redux'
import ListItem from '@material-ui/core/ListItem';
import FolderOpenIcon from '@material-ui/icons/FolderOpen';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';

function LoadButton(props) {

  const onInputClick = (event) => event.target.value = ''

  function uploadState(e) {
    const fileReader = new FileReader()
    fileReader.readAsText(e.target.files[0], 'UTF-8')
    const name = e.target.files[0].name.split('.json')[0]
    fileReader.onload = e => {
      props.dispatch({type: 'sequence/load', sequence: JSON.parse(e.target.result), name: name})
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
  return {sequence: state['sequence'],
          }
}

export default connect(mapStateToProps)(LoadButton)
