import React from 'react';
import {connect} from 'react-redux'
import ListItem from '@material-ui/core/ListItem';
import SaveIcon from '@material-ui/icons/Save';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import omitDeep from 'omit-deep-lodash'

function SaveButton(props) {
  function activeSequence() {
    // returns the sequence with the inactive channels removed
    let inactiveTTLs = props.channels.filter(e => !props.ui.channels.includes(e))
    console.log(inactiveTTLs)
    return omitDeep(props.sequence, ...inactiveTTLs)   // remove inactive channels from state

  }

  return (
    <ListItem button component="a"
              href={`data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(activeSequence()))}`}
              download={`${props.sequenceName}.json`}
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
          sequenceName: state['active_sequence'],
          ui: state['ui'],
          channels: state['channels']
          }
}

export default connect(mapStateToProps)(SaveButton)
