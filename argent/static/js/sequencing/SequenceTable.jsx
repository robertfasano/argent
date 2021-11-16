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
import TTLTable from './ttl/TTLTable.jsx'
import DACTimelines from './dac/DACTimelines.jsx'
import DDSTable from './dds/DDSTable.jsx'
import DDSFrequencyTable from './dds/DDSFrequencyTable.jsx'
import ADCTable from './adc/ADCTable.jsx'
import CameraTable from './camera/CameraTable.jsx'

import SequenceToolbar from './SequenceToolbar.jsx'
import ScriptSelector from './ScriptSelector.jsx'

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

  return (
    <>
      <TimestepContextMenu state={timestepMenu}
                           close={closeTimestepMenu}
                           length={props.steps.length}
            />
      <Paper elevation={6} style={{ overflowX: 'auto' }}>
        <Box p={2}>
          <SequenceToolbar name={props.activeSequence}/>
        </Box>
        <Box px={2}>
          <ScriptSelector/>
        </Box>
        <Box p={2} style={{ display: 'inline-block' }}>
          <Table>
            <TableHead>
              <TimestepTable onContextMenu={handleTimestepMenu}/>
            </TableHead>
            <TableBody>
              {props.elements.ttl ? <TTLTable expanded={expanded.ttl} setExpanded={() => expand('ttl')}/> : null}
              {props.elements.dac ? <DACTimelines expanded={expanded.dac} setExpanded={() => expand('dac')}/> : null}
              {props.elements.dds ? <DDSTable expanded={expanded.dds} setExpanded={() => expand('dds')}/> : null}
              {props.elements.dds ? <DDSFrequencyTable expanded={expanded.dds_freq} setExpanded={() => expand('dds_freq')}/> : null}
              {props.elements.adc ? <ADCTable expanded={expanded.adc} setExpanded={() => expand('adc')}/> : null}
              {props.elements.cam ? <CameraTable expanded={expanded.cam} setExpanded={() => expand('cam')}/> : null}
            </TableBody>
          </Table>
        </Box>
      </Paper>
    </>
  )
}

SequenceTable.propTypes = {
  dispatch: PropTypes.func,
  steps: PropTypes.array,
  activeSequence: PropTypes.string
}

function mapStateToProps (state, ownProps) {
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
    steps: state.sequences[state.active_sequence].steps,
    activeSequence: state.active_sequence,
    elements: {'ttl': renderTTL, 'dac': renderDAC, 'dds': renderDDS, 'adc': renderADC, 'cam': renderCam}
  }
}
export default connect(mapStateToProps)(SequenceTable)
