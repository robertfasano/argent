import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import Button from '@material-ui/core/Button'
import RedoIcon from '@material-ui/icons/Redo'
import { ActionCreators } from 'redux-undo'

function RedoButton (props) {
  return (
    <Button onClick={() => props.dispatch(ActionCreators.redo())}>
      <RedoIcon/>
    </Button>
  )
}

RedoButton.propTypes = {
  dispatch: PropTypes.func
}

export default connect()(RedoButton)
