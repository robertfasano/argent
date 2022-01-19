import React from 'react'
import PropTypes from 'prop-types'
import Box from '@material-ui/core/Box'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableHead from '@material-ui/core/TableHead'
import Paper from '@material-ui/core/Paper'
import { connect } from 'react-redux'
import TimestepContextMenu from './timing/TimestepContextMenu.jsx'
import TimestepTable from './timing/TimestepTable.jsx'
import TimestepLabelTable from './timing/TimestepLabelTable.jsx'
import TTLTable from './ttl/TTLTable.jsx'
import DACTimelines from './dac/DACTimelines.jsx'
import DDSTable from './dds/DDSTable.jsx'
import DDSFrequencyTable from './dds/DDSFrequencyTable.jsx'
import ADCTable from './adc/ADCTable.jsx'
import CameraTable from './camera/CameraTable.jsx'
import SequenceToolbar from './SequenceToolbar.jsx'
import ScriptPopover from './ScriptPopover.jsx'
import { selectSequenceLength } from '../selectors'

function SequenceTable (props) {
  // Displays a grid of widgets allowing sequences to be defined.
  const [expanded, setExpanded] = React.useState({ ttl: true, dac: true, dds: true, dds_freq: true, dds_amp: true, adc: true, cam: true })
  const [timestepMenu, setTimestepMenu] = React.useState({ anchor: null, index: null })

  function handleTimestepMenu (event, name, index) {
    event.preventDefault()
    setTimestepMenu({ anchor: event.currentTarget, index: index })
  }

  function closeTimestepMenu () {
    setTimestepMenu({ anchor: null, index: null })
  }

  function expand (name) {
    setExpanded({ ...expanded, [name]: !expanded[name] })
  }

  const [scriptAnchor, setScriptAnchor] = React.useState(false)

  return (
    <>
      <ScriptPopover anchor={scriptAnchor} setAnchor={setScriptAnchor}/>
      <TimestepContextMenu state={timestepMenu}
                           close={closeTimestepMenu}
                           length={props.length}
            />
      <Paper elevation={6} style={{ overflowX: 'auto' }}>
        <Box p={2}>
          <SequenceToolbar name={props.activeSequence} scriptAnchor={scriptAnchor} setScriptAnchor={setScriptAnchor}/>
        </Box>
        <Box p={2} style={{ display: 'inline-block' }}>
          <Table>
            <TableHead>
              <TimestepTable onContextMenu={handleTimestepMenu}/>
              <TimestepLabelTable/>

            </TableHead>
            <TableBody>
              {props.renderTTL ? <TTLTable expanded={expanded.ttl} setExpanded={() => expand('ttl')}/> : null}
              {props.renderDAC ? <DACTimelines expanded={expanded.dac} setExpanded={() => expand('dac')}/> : null}
              {props.renderDDS ? <DDSTable expanded={expanded.dds} setExpanded={() => expand('dds')}/> : null}
              {props.renderDDS ? <DDSFrequencyTable expanded={expanded.dds_freq} setExpanded={() => expand('dds_freq')}/> : null}
              {props.renderADC ? <ADCTable expanded={expanded.adc} setExpanded={() => expand('adc')}/> : null}
              {props.renderCam ? <CameraTable expanded={expanded.cam} setExpanded={() => expand('cam')}/> : null}
            </TableBody>
          </Table>
        </Box>
      </Paper>
    </>
  )
}

SequenceTable.propTypes = {
  dispatch: PropTypes.func,
  length: PropTypes.number,
  activeSequence: PropTypes.string,
  renderTTL: PropTypes.bool,
  renderDAC: PropTypes.bool,
  renderDDS: PropTypes.bool,
  renderADC: PropTypes.bool,
  renderCam: PropTypes.bool
}

function mapStateToProps (state, ownProps) {
  state = state.present
  let renderTTL = false
  if (Object.keys(state.channels).includes('ttl')) {
    if (Object.keys(state.channels.ttl).length > 0) {
      renderTTL = true
    }
  }

  let renderDAC = false
  if (Object.keys(state.channels).includes('dac')) {
    if (Object.keys(state.channels.dac).length > 0) {
      renderDAC = true
    }
  }

  let renderDDS = false
  if (Object.keys(state.channels).includes('dds')) {
    if (Object.keys(state.channels.dds).length > 0) {
      renderDDS = true
    }
  }

  let renderADC = false
  if (Object.keys(state.channels).includes('adc')) {
    if (Object.keys(state.channels.adc).length > 0) {
      renderADC = true
    }
  }

  let renderCam = false
  if (Object.keys(state.channels).includes('cam')) {
    if (Object.keys(state.channels.cam).length > 0) {
      renderCam = true
    }
  }

  return {
    length: selectSequenceLength(state),
    activeSequence: state.active_sequence,
    renderTTL,
    renderDAC,
    renderDDS,
    renderADC,
    renderCam
  }
}
export default connect(mapStateToProps)(SequenceTable)
