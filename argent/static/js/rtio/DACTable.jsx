import React from 'react'
import PropTypes from 'prop-types'
import TableCell from '@material-ui/core/TableCell'
import TableRow from '@material-ui/core/TableRow'
import Typography from '@material-ui/core/Typography'
import IconButton from '@material-ui/core/IconButton'
import { connect } from 'react-redux'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import ExpandLessIcon from '@material-ui/icons/ExpandLess'
import DACButton from './DACButton.jsx'

function DACTable (props) {
  return (
    <>
        <TableRow>
          <TableCell>
            <IconButton onClick={props.setExpanded} >
              {props.expanded
                ? <ExpandLessIcon/>
                : <ExpandMoreIcon /> }
              <Typography style={{ fontSize: 24, color: 'black' }}> <b>DAC</b> </Typography>
            </IconButton>
          </TableCell>
        </TableRow>

        {/* DAC buttons */}
        {props.expanded
          ? (
          <React.Fragment>
          {Object.keys(props.channels).map(board => (
            <React.Fragment key={board}>
            {
            Object.keys(props.channels[board]).map(ch => (
              <TableRow key={`${board}${ch}`}>
                <TableCell>
                  <Typography style={{ fontSize: 14 }}>
                    {props.channels[board][ch]}
                  </Typography>
                </TableCell>
                {
                  props.steps.map((step, index) => (
                      <DACButton timestep={index} ch={ch} key={'dac-' + board + ch + index} board={board}/>

                  )
                  )

                }
              </TableRow>
            ))
          }

          </React.Fragment>

          )

          )}
          </React.Fragment>
            )
          : null
    }
    </>
  )
}

DACTable.propTypes = {
  dispatch: PropTypes.func,
  steps: PropTypes.array,
  channels: PropTypes.object,
  expanded: PropTypes.bool,
  setExpanded: PropTypes.func
}

function mapStateToProps (state, ownProps) {
  return {
    channels: state.channels.DAC,
    steps: state.sequences[state.active_sequence].steps
  }
}
export default connect(mapStateToProps)(DACTable)
