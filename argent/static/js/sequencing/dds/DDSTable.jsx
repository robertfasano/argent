import React from 'react'
import PropTypes from 'prop-types'
import TableCell from '@material-ui/core/TableCell'
import TableRow from '@material-ui/core/TableRow'
import Typography from '@material-ui/core/Typography'
import IconButton from '@material-ui/core/IconButton'
import { connect } from 'react-redux'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import ExpandLessIcon from '@material-ui/icons/ExpandLess'
import DDSButton from './DDSButton.jsx'
import DDSContextMenu from './DDSContextMenu.jsx'
import DDSAttenuationPopover from './DDSAttenuationPopover.jsx'
import TimestepLabelTable from '../timing/TimestepLabelTable.jsx'
import { selectSequenceLength, selectPresentState } from '../../selectors'

function DDSTable (props) {
  const [menu, setMenu] = React.useState({ anchor: null, channel: null, timestep: null })

  function handleMenu (event, channel, timestep) {
    event.preventDefault()
    setMenu({ anchor: event.currentTarget, channel: channel, timestep: timestep })
  }

  function closeMenu () {
    setMenu({ anchor: null, channel: null, timestep: null })
  }

  const [popover, setPopover] = React.useState({ anchor: null, channel: null, timestep: null })

  function handlePopover (anchor, channel, timestep) {
    event.preventDefault()
    setPopover({ anchor: anchor, channel: channel, timestep: timestep })
  }

  function closePopover () {
    setPopover({ anchor: null, channel: null, timestep: null })
  }

  return (
    <>
    <DDSContextMenu state={menu} close={closeMenu} handlePopover={handlePopover}/>
    <DDSAttenuationPopover state={popover} close={closePopover}/>
    <TableRow>
      <TableCell colSpan={9} align='left'>
        <IconButton onClick={props.setExpanded} color='default' >
          {props.expanded
            ? <ExpandLessIcon/>
            : <ExpandMoreIcon /> }
          <Typography style={{ fontSize: 24, color: 'black' }}> <b>DDS enable</b> </Typography>
        </IconButton>
      </TableCell>
    </TableRow>

    {props.expanded
      ? (
      <React.Fragment>
      <TimestepLabelTable disabled={true}/>
      {Object.keys(props.channels).map(ch => (
        <React.Fragment key={ch + '-fragment'}>
          <TableRow>
            <TableCell>
              <Typography style={{ fontSize: 14 }} noWrap={true}>
                {props.channels[ch]}
              </Typography>
            </TableCell>
            {
              [...Array(props.length).keys()].map((step, index) => (
                <DDSButton timestep={index} ch={ch} key={'dds-' + ch + index} onContextMenu={(event) => handleMenu(event, ch, index)}/>
              )
              )

            }
          </TableRow>
        </React.Fragment>
      ))}
      </React.Fragment>
        )
      : null
}
    </>
  )
}

DDSTable.propTypes = {
  dispatch: PropTypes.func,
  channels: PropTypes.object,
  expanded: PropTypes.bool,
  setExpanded: PropTypes.func,
  length: PropTypes.number
}

function mapStateToProps (state, ownProps) {
  state = selectPresentState(state)
  return {
    channels: state.channels.dds,
    length: selectSequenceLength(state)
  }
}
export default connect(mapStateToProps)(DDSTable)
