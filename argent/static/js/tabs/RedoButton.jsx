import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import Button from '@material-ui/core/Button'
import RedoIcon from '@material-ui/icons/Redo'
import { ActionCreators } from 'redux-undo'

function RedoButton (props) {
  console.log(props.futureStates, props.futureStates === 0)
  return (
    <Button onClick={() => props.dispatch(ActionCreators.redo())} disabled={props.futureStates === 0}>
      <RedoIcon/>
    </Button>
  )
}

RedoButton.propTypes = {
  dispatch: PropTypes.func,
  futureStates: PropTypes.number
}

const mapStateToProps = (state, props) => {
  return {
    futureStates: state.future.length
  }
}
export default connect(mapStateToProps)(RedoButton)
