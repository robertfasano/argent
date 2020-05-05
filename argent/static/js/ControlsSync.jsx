import React from 'react';
import {connect} from 'react-redux'
import {post} from './utilities.js'

function ControlsSync(props) {
  post('/controls', props.controls)   // synchronize with backend when controls change

  return (
    <React.Fragment/>
  )
}

function mapStateToProps(state, ownProps) {
  return {controls: state.controls
        }
}
export default connect(mapStateToProps)(ControlsSync)
