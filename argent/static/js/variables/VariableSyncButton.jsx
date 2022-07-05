import React from 'react'
import PropTypes from 'prop-types'
import { connect, shallowEqual } from 'react-redux'
import { post } from '../utilities.js'
import Button from '@material-ui/core/Button'
import Box from '@material-ui/core/Box'
import SendIcon from '@material-ui/icons/Send'
import { createSelector } from 'reselect'
import { selectPresentState } from '../selectors.js'

function VariableSyncButton (props) {
  function sendVariables () {
    post('/variables', props.variables)
  }

  return (
    <Button onClick={sendVariables} style={{ textTransform: 'none' }}>
      <SendIcon/>
      <Box px={2}>Send</Box>
    </Button>
  )
}

VariableSyncButton.propTypes = {
  variables: PropTypes.object
}

const makeSelector = () => createSelector(
  state => state.variables,
  (state, props) => props.items,
  (variables, items) => {
    const vars = {}
    for (const name of items) {
      vars[name] = variables[name]
    }
    return vars
  },
  { memoizeOptions: { resultEqualityCheck: shallowEqual } }
)

const makeMapStateToProps = () => {
  const selectVariables = makeSelector()
  const mapStateToProps = (state, props) => {
    state = selectPresentState(state)
    return {
      variables: selectVariables(state, props)
    }
  }
  return mapStateToProps
}

export default connect(makeMapStateToProps)(VariableSyncButton)
