import React from 'react'
import PropTypes from 'prop-types'
import Box from '@material-ui/core/Box'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableHead from '@material-ui/core/TableHead'
import Paper from '@material-ui/core/Paper'
import { connect } from 'react-redux'
import TimestepContextMenu from './rtio/TimestepContextMenu.jsx'
import TimestepTable from './rtio/TimestepTable.jsx'
import TTLTable from './rtio/TTLTable.jsx'
import DACTimelines from './rtio/DACTimelines.jsx'
import DDSTable from './rtio/DDSTable.jsx'
import DDSFrequencyTable from './rtio/DDSFrequencyTable.jsx'
import ADCTable from './rtio/ADCTable.jsx'
import SequenceToolbar from './SequenceToolbar.jsx'

function SequenceTable (props) {
  // Displays a grid of widgets allowing sequences to be defined.
  const [expanded, setExpanded] = React.useState({ ttl: true, dac: true, dds: true, dds_freq: true, dds_amp: true, adc: true })
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
        <Box p={2} style={{ display: 'inline-block' }}>
          <Table>
            <TableHead>
              <TimestepTable onContextMenu={handleTimestepMenu}/>
            </TableHead>
            <TableBody>
              <TTLTable expanded={expanded.ttl} setExpanded={() => expand('ttl')}/>
              <DACTimelines expanded={expanded.dac} setExpanded={() => expand('dac')}/>
              <DDSTable expanded={expanded.dds} setExpanded={() => expand('dds')}/>
              <DDSFrequencyTable expanded={expanded.dds_freq} setExpanded={() => expand('dds_freq')}/>
              <ADCTable expanded={expanded.adc} setExpanded={() => expand('adc')}/>
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
  return {
    steps: state.sequences[state.active_sequence].steps,
    activeSequence: state.active_sequence
  }
}
export default connect(mapStateToProps)(SequenceTable)
