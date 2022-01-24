import React from 'react'
import Box from '@material-ui/core/Box'
import FavoriteBorderIcon from '@material-ui/icons/FavoriteBorder'
import FavoriteIcon from '@material-ui/icons/Favorite'
import CircularProgress from '@material-ui/core/CircularProgress'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { selectPresentState } from '../selectors'

function Heartbeat (props) {
  const loading = props.submittedPID != null && props.submittedPID !== props.activePID

  return (
    loading
      ? (
      <Box mr={1} mt={0.5}>
        <CircularProgress style={{ color: 'white' }}/>
      </Box>
        )
      : (
      <Box mr={1} mt={0.5}>
        {props.heartbeat ? <FavoriteIcon/> : <FavoriteBorderIcon/>}
      </Box>
        )
  )
}

Heartbeat.propTypes = {
  heartbeat: PropTypes.bool,
  submittedPID: PropTypes.string,
  activePID: PropTypes.string
}

function mapStateToProps (state, ownProps) {
  state = selectPresentState(state)
  return {
    heartbeat: state.ui.heartbeat,
    submittedPID: state.ui.pid.submitted,
    activePID: state.ui.pid.active
  }
}

export default connect(mapStateToProps)(Heartbeat)
