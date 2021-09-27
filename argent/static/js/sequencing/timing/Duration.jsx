import React from 'react'
import PropTypes from 'prop-types'
import Popover from '@material-ui/core/Popover'
import Box from '@material-ui/core/Box'
import Typography from '@material-ui/core/Typography'
import { connect } from 'react-redux'
import LinkableParameter from '../../components/LinkableParameter.jsx'
import Button from '@material-ui/core/Button'

function Duration (props) {
  // A button which opens a popover allowing timestep durations to be defined or linked to variables
  const [anchorEl, setAnchorEl] = React.useState(null)

  const style = {
    background: 'white',
    opacity: 1,
    color: 'black',
    fontSize: 10,
    textTransform: 'none',
    whiteSpace: 'pre-line'
  }

  const handleClick = (event) => {
    event.preventDefault()
    setAnchorEl(event.currentTarget)
  }

  let displayText = ''
  if (props.duration.includes('self.')) {
    displayText = props.inputs[props.duration.split('self.')[1]] + ' ms'
  } else if (props.duration !== '') {
    displayText = props.duration
  }

  return (
    <>
      <Button
      disableRipple={true}
      style={style}
      onClick={handleClick}
      >
        <Typography> {displayText} </Typography>
      </Button>
      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={(event) => setAnchorEl(null)}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right'
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left'
        }}
      >
      <Box p={1}>
        <Typography style={{ fontWeight: 'bold', fontSize: 24 }}>
            Duration options
        </Typography>
        <LinkableParameter value={props.duration.split(' ')[0]}
                           inputs={props.inputs}
                           onChange={(value) => props.update('timestep/duration', value)}
                           label='Duration' unit='ms'
        />
        </Box>
      </Popover>
      </>
  )
}

Duration.propTypes = {
  timestep: PropTypes.number,
  duration: PropTypes.string,
  inputs: PropTypes.object,
  update: PropTypes.func
}

function mapDispatchToProps (dispatch, props) {
  return {
    update: (type, value) => {
      let data = value
      if (!value.includes('self.')) {
        data = data + ' ms'
      }
      dispatch({ type, duration: data, timestep: props.timestep })
    }

  }
}

function mapStateToProps (state, props) {
  return {
    duration: state.sequences[state.active_sequence].steps[props.timestep].duration,
    inputs: state.inputs
  }
}
export default connect(mapStateToProps, mapDispatchToProps)(Duration)
