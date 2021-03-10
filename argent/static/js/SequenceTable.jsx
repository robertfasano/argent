import React from 'react'
import PropTypes from 'prop-types'
import Box from '@material-ui/core/Box'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import Paper from '@material-ui/core/Paper'
import Typography from '@material-ui/core/Typography'
import IconButton from '@material-ui/core/IconButton'
import { connect } from 'react-redux'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import ExpandLessIcon from '@material-ui/icons/ExpandLess'
import TTLButton from './rtio/TTLButton.jsx'
import VariableUnitInput from './components/VariableUnitInput.jsx'
import MacroContextMenu from './MacroContextMenu.jsx'
import TimestepContextMenu from './rtio/TimestepContextMenu.jsx'
import Button from '@material-ui/core/Button'
import AddIcon from '@material-ui/icons/Add'
import Select from '@material-ui/core/Select'
import MenuItem from '@material-ui/core/MenuItem'
import DACButton from './rtio/DACButton.jsx'
import ChannelMenu from './rtio/ChannelMenu.jsx'
import NewChannelButton from './rtio/NewChannelButton.jsx'

function SequenceTable (props) {
  // Displays a grid of widgets allowing sequences to be defined. Has display
  // modes for both individual sequences and the master sequence; the latter
  // allows combination of arbitrary individual sequences, possibly each with
  // varying numbers of repetitions, into a macrosequence.
  const [expanded, setExpanded] = React.useState({ ttl: true, dac: true, dds: true, adc: true, script: true })
  const [anchorEl, setAnchorEl] = React.useState(null)
  const [anchorName, setAnchorName] = React.useState('')

  function handleClick (event, name) {
    event.preventDefault()
    setAnchorEl(event.currentTarget)
    setAnchorName(name)
  }

  function add () {
    if (props.tableChoice === 'master') {
      props.dispatch({ type: 'macrosequence/append', sequence: props.macrosequence[props.macrosequence.length - 1] })
    } else {
      props.dispatch({ type: 'timestep/insert', timestep: props.macrosequence[0].sequence.length, sequenceName: props.macrosequence[0].name })
    }
  }

  function expand (name) {
    setExpanded({ ...expanded, [name]: !expanded[name] })
  }

  function updateTimestep (timestep, duration, sequenceName) {
    props.dispatch({ type: 'timestep/duration', timestep: timestep, duration: duration, sequenceName: sequenceName })
  }

  function chooseSequence (index, name) {
    props.dispatch({ type: 'macrosequence/updateSequence', index: index, name: name })
  }

  return (
    <Paper elevation={6} style={{ overflowX: 'auto' }}>
    <Box px={2} style={{ display: 'inline-block' }}>
        <Table>
          <TableHead>
            {/* timestep control icons */}
            <TableRow>
            <TableCell/>
            {props.tableChoice === 'master'
              ? (
                  props.macrosequence.map((stage, i) => (
                <TableCell key={i} colSpan={stage.sequence.length} align='center'>
                  <List style={{
                    display: 'flex',
                    flexDirection: 'row',
                    padding: 0
                  }}>
                  <ListItem>
                  <Select value={stage.name}
                          width='100%'
                          onChange={(event) => chooseSequence(i, event.target.value)}
                          >
                    {Object.keys(props.sequences).map((name, index) => {
                      return (
                          <MenuItem key={name} value={name}>{name}</MenuItem>
                      )
                    }
                    )
                    }
                  </Select>
                  </ListItem>
                  {stage.reps > 1
                    ? <ListItem>
                  <Typography>
                    {`(x${stage.reps})`}
                  </Typography>
                  </ListItem>
                    : null }
                  </List>
                </TableCell>
                  ))
                )
              : (null)
            }
            </TableRow>
            <TableRow>
              <TableCell/>
              {
                props.macrosequence.map((stage, index) => (
                  props.tableChoice === 'master'
                    ? (
                      <MacroContextMenu colSpan={stage.sequence.length} timestep={index} length={props.macrosequence.length} key={index} sequenceName={stage.name}/>
                      )
                    : (
                      <TimestepContextMenu timestep={index} length={props.macrosequence[0].sequence.length} key={index}/>
                      )
                ))
              }
            </TableRow>
            {/* timesteps row */}
            <TableRow>
              <TableCell/>
              {
                props.macrosequence.map((stage) => (
                  stage.sequence.map((step, index) => (
                    <TableCell key={index}>
                      <VariableUnitInput value={step.duration}
                                     onChange = {(value) => updateTimestep(index, value, stage.name)}
                                     units = {['s', 'ms', 'us']}
                      />
                    </TableCell>
                  ))
                ))
              }
              <TableCell>
                <Button onClick={add}>
                  <AddIcon/>
                </Button>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
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
            {expanded.ttl
              ? (
              <React.Fragment>
              {props.channels.TTL.map(i => (
                <TableRow key={i}>
                  <TableCell onContextMenu={(event) => handleClick(event, i)} style={{ width: '100px' }}>
                    <Typography style={{ fontSize: 14 }}>
                      {props.aliases.TTL[i]}
                    </Typography>
                  </TableCell>
                  <ChannelMenu channel={i} type='TTL' anchorEl={anchorEl} setAnchorEl={setAnchorEl} anchorName={anchorName}/>
                  {
                    props.macrosequence.map((stage) => (
                      stage.sequence.map((step, index) => (
                        <TTLButton timestep={index} channel={i} key={'ttl-' + i + index} on={step.ttl[i]} sequenceName={stage.name}/>
                      ))
                    ))
                  }
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
                {props.macrosequence.map((stage) => (
                  stage.sequence.map((step, index) => (
                      <DACButton timestep={index} ch={ch} key={'dac-' + board + ch + index} sequenceName={stage.name} board={board}/>

                  )
                  )

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

SequenceTable.propTypes = {
  dispatch: PropTypes.func,
  macrosequence: PropTypes.array,
  sequences: PropTypes.object,
  channels: PropTypes.object,
  aliases: PropTypes.object,
  tableChoice: PropTypes.string
}

function mapStateToProps (state, ownProps) {
  const macrosequence = []
  if (ownProps.tableChoice === 'master') {
    for (const stage of state.macrosequence) {
      const newStage = { name: stage.name, sequence: state.sequences[stage.name], reps: stage.reps }
      macrosequence.push(newStage)
    }
  } else {
    macrosequence.push({ name: state.active_sequence, reps: 1, sequence: state.sequences[state.active_sequence] })
  }

  return {
    channels: state.ui.channels,
    macrosequence: macrosequence,
    sequences: state.sequences,
    aliases: state.aliases
  }
}
export default connect(mapStateToProps)(SequenceTable)
