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

  // anchor and state for ChannelMenu
  const [anchorEl, setAnchorEl] = React.useState(null)
  const [anchorName, setAnchorName] = React.useState('')
  const [anchorType, setAnchorType] = React.useState('')
  const [anchorBoard, setAnchorBoard] = React.useState('')

  // anchor and state for TimestepContextMenu
  const [timestepAnchorEl, setTimestepAnchorEl] = React.useState(null)
  const [timestepAnchorIndex, setTimestepAnchorIndex] = React.useState(null)

  function handleChannelMenu (event, name, channelType, board) {
    event.preventDefault()
    setAnchorEl(event.currentTarget)
    setAnchorName(name)
    setAnchorType(channelType)
    setAnchorBoard(board)
  }

  function handleTimestepMenu (event, name, index) {
    event.preventDefault()
    setTimestepAnchorEl(event.currentTarget)
    setTimestepAnchorIndex(index)
  }

  function expand (name) {
    setExpanded({ ...expanded, [name]: !expanded[name] })
  }

  return (
    <>
      <TimestepContextMenu anchorEl={timestepAnchorEl}
                            setAnchorEl={setTimestepAnchorEl}
                            timestep={timestepAnchorIndex}
                            length={props.macrosequence[0].sequence.length}
            />
      <ChannelMenu anchorEl={anchorEl} setAnchorEl={setAnchorEl} anchorName={anchorName} anchorType={anchorType} anchorBoard={anchorBoard}/>
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
  macrosequence: PropTypes.array,
  sequences: PropTypes.object,
  channels: PropTypes.object,
  aliases: PropTypes.object
}

function mapStateToProps (state, ownProps) {
  const macrosequence = [{ name: state.active_sequence, reps: 1, sequence: state.sequences[state.active_sequence].steps }]

  return {
    channels: state.ui.channels,
    macrosequence: macrosequence,
    sequences: state.sequences,
    aliases: state.aliases
  }
}
export default connect(mapStateToProps)(SequenceTable)
