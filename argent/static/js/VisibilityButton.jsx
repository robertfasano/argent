import React from 'react';
import Button from '@material-ui/core/Button';
import {connect} from 'react-redux'
import VisibilityIcon from '@material-ui/icons/Visibility';
import VisibilityOffIcon from '@material-ui/icons/VisibilityOff';

function VisibilityButton(props) {
  function toggleHideInactive() {
    props.dispatch({type: 'ui/hideInactive', value: !props.hideInactive})
  }
  return (
    <Button onClick={toggleHideInactive}>
      {props.hideInactive? <VisibilityOffIcon/>: <VisibilityIcon/>}
    </Button>
  )
}


function mapStateToProps(state, ownProps){
  return {hideInactive: state.ui.hideInactive,
        }
}
export default connect(mapStateToProps)(VisibilityButton)
