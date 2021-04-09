import React from 'react'
import Box from '@material-ui/core/Box'
import FavoriteBorderIcon from '@material-ui/icons/FavoriteBorder';
import FavoriteIcon from '@material-ui/icons/Favorite';
import CircularProgress from '@material-ui/core/CircularProgress';
import Typography from '@material-ui/core/Typography';
import Popover from '@material-ui/core/Popover';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

function Heartbeat (props) {
  const loading = props.submittedPID != null && props.submittedPID != props.activePID

  return (
    loading? (
      <Box mr={1} mt={0.5}>
        <CircularProgress style={{color: "white"}}/>
      </Box>
    ) :
    (
      <Box mr={1} mt={0.5}>
        {props.heartbeat? <FavoriteIcon/>: <FavoriteBorderIcon/>}
      </Box>
    )
  )
}

Heartbeat.propTypes = {
  heartbeat: PropTypes.bool
}

function mapStateToProps (state, ownProps) {
  return {
    heartbeat: state.ui.heartbeat,
    submittedPID: state.ui.pid.submitted,
    activePID: state.ui.pid.active
  }
}

export default connect(mapStateToProps)(Heartbeat)