import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import Timeline from '../../components/Timeline.jsx'
import DACPopover from './DACPopover.jsx'
import { createSelector } from 'reselect'
import { isArrayEqual } from '../../utilities.js'
import { selectActiveSequence, selectPresentState } from '../../selectors'

function DACTimeline (props) {
  const [anchorPosition, setAnchorPosition] = React.useState([0, 0])
  const [open, setOpen] = React.useState(false)
  const [timestep, setTimestep] = React.useState(0)
  function handleClick (timestep, event) {
    setAnchorPosition([event.x, event.y])
    setOpen(true)
    setTimestep(timestep)
  }

  return (
    <>
      <Timeline data={props.data} onClick={handleClick} unit='V'/>
      <DACPopover anchorPosition={anchorPosition} setAnchorPosition={setAnchorPosition} ch={props.ch} board={props.board} timestep={timestep} open={open} setOpen={setOpen}/>
    </>
  )
}

DACTimeline.propTypes = {
  data: PropTypes.array,
  ch: PropTypes.string,
  board: PropTypes.string
}

const makeSelector = () => createSelector(
  (state) => selectActiveSequence(state).steps,
  (state, props) => props.board,
  (state, props) => props.ch,
  (steps, board, channel) => {
    const data = []
    for (const step of steps) {
      if (step.skip) {
        data.push({ mode: 'setpoint', setpoint: '', ramp: { start: '', stop: '', steps: 10 }, spline: { points: [], steps: 10 } })
      } else {
        data.push(step.dac[board][channel])
      }
    }
    return data
  },
  { memoizeOptions: { resultEqualityCheck: isArrayEqual } }
)

const makeMapStateToProps = () => {
  const selector = makeSelector()
  const mapStateToProps = (state, props) => {
    state = selectPresentState(state)
    return { data: selector(state, props) }
  }
  return mapStateToProps
}

export default connect(makeMapStateToProps)(DACTimeline)
