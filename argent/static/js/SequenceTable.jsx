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
import DACTable from './rtio/DACTable.jsx'
import DDSTable from './rtio/DDSTable.jsx'
import ADCTable from './rtio/ADCTable.jsx'
import ChannelMenu from './rtio/ChannelMenu.jsx'

function SequenceTable (props) {
  // Displays a grid of widgets allowing sequences to be defined.
  const [expanded, setExpanded] = React.useState({ ttl: true, dac: true, dds: true, adc: true, script: true })
  const [channelMenu, setChannelMenu] = React.useState({ anchor: null, ch: '', board: '', type: '' })
  const [timestepMenu, setTimestepMenu] = React.useState({ anchor: null, index: null })

  function handleChannelMenu (event, name, channelType, board) {
    event.preventDefault()
    setChannelMenu({ anchor: event.currentTarget, ch: name, board: board, type: channelType })
  }

  function closeChannelMenu () {
    setChannelMenu({ anchor: null, ch: '', board: '', type: '' })
  }

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
      <ChannelMenu state={channelMenu} close={closeChannelMenu}/>
      <Paper elevation={6} style={{ overflowX: 'auto' }}>
        <Box p={2} style={{ display: 'inline-block' }}>
          <Table>
            <TableHead>
              <TimestepTable onContextMenu={handleTimestepMenu}/>
            </TableHead>
            <TableBody>
              <TTLTable expanded={expanded.ttl} setExpanded={() => expand('ttl')} onContextMenu={handleChannelMenu}/>
              <DACTable expanded={expanded.dac} setExpanded={() => expand('dac')} onContextMenu={handleChannelMenu}/>
              <DDSTable expanded={expanded.dds} setExpanded={() => expand('dds')} onContextMenu={handleChannelMenu}/>
              <ADCTable expanded={expanded.adc} setExpanded={() => expand('adc')} onContextMenu={handleChannelMenu}/>
            </TableBody>
          </Table>
        </Box>
      </Paper>
    </>
  )
}

SequenceTable.propTypes = {
  dispatch: PropTypes.func,
  steps: PropTypes.array
}

function mapStateToProps (state, ownProps) {
  return {
    steps: state.sequences[state.active_sequence].steps
  }
}
export default connect(mapStateToProps)(SequenceTable)
