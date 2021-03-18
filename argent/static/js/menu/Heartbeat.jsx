import React from 'react'
import Box from '@material-ui/core/Box'
import FavoriteBorderIcon from '@material-ui/icons/FavoriteBorder';
import FavoriteIcon from '@material-ui/icons/Favorite';
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

function Heartbeat (props) {
  return (
    <Box mr={1} mt={0.5}>
      {props.heartbeat? <FavoriteIcon/>: <FavoriteBorderIcon/>}
    </Box>
  )
}

Heartbeat.propTypes = {
  heartbeat: PropTypes.bool
}

function mapStateToProps (state, ownProps) {
  return {
    heartbeat: state.ui.heartbeat
  }
}

export default connect(mapStateToProps)(Heartbeat)
