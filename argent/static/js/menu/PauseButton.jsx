import React from 'react'
import PauseIcon from '@material-ui/icons/Pause';
import PauseCircleFilledIcon from '@material-ui/icons/PauseCircleFilled';
import Box from '@material-ui/core/Box';
import ListItem from '@material-ui/core/ListItem';
import Typography from '@material-ui/core/Typography';
import {post} from '../utilities.js'
import {connect} from 'react-redux'

function PauseButton(props) {
  function pause() {
    if (props.controls['paused']) {
      props.dispatch({type: 'controls/paused', value: false})
      props.dispatch({type: 'controls/update', data: {latch: false}})
    }
    else {
      props.dispatch({type: 'controls/paused', value: true})
    }
  }
  let pauseText = props.controls.paused? "Resume": "Pause"

  return (
    <ListItem button onClick={pause}>
      <Box mr={1} mt={0.5}>
        {props.controls.paused? <PauseCircleFilledIcon/>: <PauseIcon/>}
      </Box>
      <Typography>{pauseText}</Typography>
    </ListItem>
  )
}

function mapStateToProps(state, ownProps){
  return {
          controls: state['controls']
        }
}
export default connect(mapStateToProps)(PauseButton)
