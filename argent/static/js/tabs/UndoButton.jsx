import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import Button from '@material-ui/core/Button'
import UndoIcon from '@material-ui/icons/Undo'
import { ActionCreators } from 'redux-undo'

function UndoButton (props) {
  return (
    <Button onClick={() => props.dispatch(ActionCreators.undo())} disabled={props.pastStates === 0}>
      <UndoIcon/>
    </Button>
  )
}

UndoButton.propTypes = {
  dispatch: PropTypes.func,
  pastStates: PropTypes.number
}

const mapStateToProps = (state, props) => {
  return {
    pastStates: state.past.length
  }
}
export default connect(mapStateToProps)(UndoButton)
