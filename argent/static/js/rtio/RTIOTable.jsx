import React from 'react'
import PropTypes from 'prop-types'
import Box from '@material-ui/core/Box'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import Paper from '@material-ui/core/Paper'
import Typography from '@material-ui/core/Typography'
import Button from '@material-ui/core/Button'
import IconButton from '@material-ui/core/IconButton'
import { connect } from 'react-redux'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import ExpandLessIcon from '@material-ui/icons/ExpandLess'
import TTLButton from './TTLButton.jsx'
import AddIcon from '@material-ui/icons/Add'
import TimestepContextMenu from './TimestepContextMenu.jsx'
import DACButton from './DACButton.jsx'
import ChannelMenu from './ChannelMenu.jsx'
import NewChannelButton from './NewChannelButton.jsx'
import VariableUnitInput from '../components/VariableUnitInput.jsx'

function RTIOTable (props) {
  // Displays a sequence and widgets for controlling RTIO events (e.g. TTL, DAC)
  const [expanded, setExpanded] = React.useState({ ttl: true, dac: true, dds: true, adc: true, script: true })
  const [anchorEl, setAnchorEl] = React.useState(null)
  const [anchorName, setAnchorName] = React.useState('')

  function handleClick (event, name) {
    event.preventDefault()
    setAnchorEl(event.currentTarget)
    setAnchorName(name)
  }

  function expand (name) {
    setExpanded({ ...expanded, [name]: !expanded[name] })
  }

  function updateTimestep (timestep, duration) {
    props.dispatch({ type: 'timestep/duration', timestep: timestep, duration: duration, sequenceName: props.sequenceName })
  }

  function addTimestep (timestep) {
    props.dispatch({ type: 'timestep/insert', timestep: props.sequence.length, sequenceName: props.sequenceName })
  }

  return (
    <Paper elevation={6} style={{ overflowX: 'auto' }}>
    <Box px={2} style={{ display: 'inline-block' }}>
        <Table>
          <TableHead>
            {/* timestep control icons */}
            <TableRow/>
            <TableRow>
              <TableCell/>
              {props.sequence.map((step, index) => (
                <TimestepContextMenu timestep={index} length={props.sequence.length} key={index}/>
              ))}
            </TableRow>
            {/* timesteps row */}
            <TableRow>
              <TableCell/>
              {props.sequence.map((step, index) => (
                <TableCell key={index}>
                  <VariableUnitInput value={step.duration}
                                 onChange = {(value) => updateTimestep(index, value)}
                                 units = {['s', 'ms', 'us']}
                  />
                </TableCell>
              ))}
              <TableCell align="left">
                <Button onClick={addTimestep}>
                  <AddIcon/>
                </Button>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>

            {/* TTL header */}
            <TableRow>
              <TableCell>
                <IconButton onClick={() => expand('ttl')} >
                  {expanded.ttl
                    ? <ExpandLessIcon/>
                    : <ExpandMoreIcon /> }
                </IconButton>
              </TableCell>
              <TableCell><Typography> <b>TTL</b> </Typography></TableCell>
            </TableRow>

            {/* TTL buttons */}
            {expanded.ttl
              ? (
              <React.Fragment>
              {props.channels.TTL.map(ch => (
                <TableRow key={ch}>
                  <TableCell onContextMenu={(event) => handleClick(event, ch)} style={{ width: '100px' }}>
                    <Typography style={{ fontSize: 14 }}>
                      {props.aliases.TTL[ch]}
                    </Typography>
                  </TableCell>
                  <ChannelMenu channel={ch} type='TTL' anchorEl={anchorEl} setAnchorEl={setAnchorEl} anchorName={anchorName}/>
                  {props.sequence.map((step, index) => (
                    <TTLButton timestep={index}
                               channel={ch}
                               key={'ttl-' + ch + index}
                               sequenceName={props.sequenceName}
                    />
                  ))}

                </TableRow>
              ))}
              <NewChannelButton channelType="TTL"/>
              </React.Fragment>
                )
              : null
        }

        {/* DAC header */}
        <TableRow>
          <TableCell>
            <IconButton onClick={() => expand('dac')} >
              {expanded.dac
                ? <ExpandLessIcon/>
                : <ExpandMoreIcon /> }
            </IconButton>
          </TableCell>
          <TableCell><Typography> <b>DAC</b> </Typography></TableCell>
        </TableRow>

        {/* DAC buttons */}
        {expanded.dac
          ? (
          <React.Fragment>
          {Object.keys(props.channels.DAC).map(board => (
            props.channels.DAC[board].map(ch => (
              <TableRow key={`${board}${ch}`}>
                <TableCell>
                  <Typography style={{ fontSize: 14 }}>
                    {props.aliases.DAC[board][ch]}
                  </Typography>
                </TableCell>
                {props.sequence.map((step, index) => (
                  <DACButton timestep={index} ch={ch} key={'dac-' + board + ch + index} sequenceName={props.sequenceName} board={board}/>
                ))}
              </TableRow>
            ))

          ))}
          </React.Fragment>
            )
          : null
    }

          </TableBody>
        </Table>
    </Box>
    </Paper>
  )
}

RTIOTable.propTypes = {
  dispatch: PropTypes.func,
  sequenceName: PropTypes.string,
  sequence: PropTypes.array,
  channels: PropTypes.object,
  aliases: PropTypes.object
}

function mapStateToProps (state, ownProps) {
  const sequence = state.sequences[state.active_sequence]
  return {
    channels: state.ui.channels,
    sequence: sequence,
    sequenceName: state.active_sequence,
    aliases: state.aliases
  }
}
export default connect(mapStateToProps)(RTIOTable)
