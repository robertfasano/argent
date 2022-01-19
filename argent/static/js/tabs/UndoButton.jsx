import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import Button from '@material-ui/core/Button'
import UndoIcon from '@material-ui/icons/Undo'
import { ActionCreators } from 'redux-undo'

function UndoButton (props) {
  return (
    <Button onClick={() => props.dispatch(ActionCreators.undo())}>
      <UndoIcon/>
    </Button>
  )
}

UndoButton.propTypes = {
  dispatch: PropTypes.func
}

export default connect()(UndoButton)
