import React from 'react';
import {connect} from 'react-redux'
import ListItem from '@material-ui/core/ListItem';
import SaveIcon from '@material-ui/icons/Save';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';

function SaveButton(props) {
  return (
    <ListItem button component="a"
              href={`data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(props.sequence))}`}
              download={`${props.sequence_name}.json`}
    >
      <Box mr={1} mt={0.5}>
        <SaveIcon/>
      </Box>
      <Typography>Save</Typography>
    </ListItem>
  )
}

function mapStateToProps(state, ownProps){
  return {sequence: state['sequences'][state['active_sequence']],
          sequence_name: state['active_sequence']
          }
}

export default connect(mapStateToProps)(SaveButton)
