import React from 'react';
import {connect} from 'react-redux'
import {post} from './utilities.js'

function VariableSync(props) {
  post('/variables', props.variables)   // synchronize with backend when variables change

  return (
    <React.Fragment/>
  )
}

function mapStateToProps(state, ownProps) {
  return {variables: state['sequence'].variables
        }
}
export default connect(mapStateToProps)(VariableSync)
