import React from 'react'
import {connect} from 'react-redux'
import {post} from './utilities.js'

function Synchronizer(props) {
  console.log('Synchronizing back-end state.')
  post('/controls', props.controls)
  post('/variables', props.variables)
  // post('/config', props.config)
  post('/save', props.sequences)

  return (
    <React.Fragment>
    </React.Fragment>
  )
}

function mapStateToProps(state, ownProps) {
  return {controls: state['controls'],
          variables: state['sequence']['variables'],
          config: state['config'],
          sequences: state['sequences']
        }
}

export default connect(mapStateToProps)(Synchronizer)
