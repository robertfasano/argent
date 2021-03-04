import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography'
import IconButton from '@material-ui/core/IconButton';
import {connect} from 'react-redux'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ExpandLessIcon from '@material-ui/icons/ExpandLess';
import TTLButton from './TTLButton.jsx'
import DACButton from './DACButton.jsx'
import DDSButton from './DDSButton.jsx'
import ADCButton from './ADCButton.jsx'
import ScriptButton from './ScriptButton.jsx'
import AddIcon from '@material-ui/icons/Add';
import ScaledInput from './ScaledInput.jsx'
import TimestepContextMenu from './TimestepContextMenu.jsx'
import Button from '@material-ui/core/Button';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';

function MacroTable(props) {
  const [expanded, setExpanded] = React.useState({'ttl': true, 'dac': true, 'dds': true, 'adc': true, 'script': true})

  function add() {
    props.dispatch({type: 'macrosequence/add', sequence: props.macrosequence[props.macrosequence.length-1]})
  }

  function expand(name) {
    setExpanded({...expanded, [name]: !expanded[name]})
  }

  function updateTimestep(timestep, duration, sequence_name) {
    props.dispatch({type: 'timestep/duration', timestep: timestep, duration: duration, sequence_name: sequence_name})
  }

  function setScale(timestep, value, sequence_name) {
    props.dispatch({type: 'timestep/scale', timestep: timestep, value: value, sequence_name: sequence_name})
  }

  function chooseSequence(index, name) {
    props.dispatch({type: 'macrosequence/updateSequence', index: index, name: name})
  }

  return (
    <Paper elevation={6} style={{overflowX: 'auto'}}>
    <Box px={2} style={{display: "inline-block"}}>
        <Table>
          <TableHead>
            {/* timestep control icons */}
            <TableRow>
            <TableCell/>
            {
              props.macrosequence.map((stage, i) => (
              <TableCell colSpan={stage.sequence.length} align='center'>
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
              </TableCell>
              ))

            }
            </TableRow>
            <TableRow>
              <TableCell/>
              {
                props.macrosequence.map((stage) => (
                  stage.sequence.map((step, index) => (
                    <TimestepContextMenu timestep={index} length={stage.sequence.length} key={index} sequence_name={stage.name}/>
                  ))
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
                      <ScaledInput value={step.duration}
                                     onChange = {(value) => updateTimestep(index, value, stage.name)}
                                     units = {{'s': 1, 'ms': 1e-3, 'us': 1e-6}}
                                     scale = {step.time_scale}
                                     setScale = {(value) => setScale(index, value, stage.name)}
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
                <IconButton onClick={()=>expand('ttl')} >
                  {expanded['ttl']?
                    <ExpandLessIcon/>: <ExpandMoreIcon /> }
                </IconButton>
              </TableCell>
              <TableCell><Typography> <b>TTL</b> </Typography></TableCell>
            </TableRow>
            {expanded['ttl']? (
              <React.Fragment>
              {props.channels.TTL.map(i => (
                <TableRow key={i}>
                  <TableCell> {i} </TableCell>
                  {
                    props.macrosequence.map((stage) => (
                      stage.sequence.map((step, index) => (
                        <TTLButton timestep={index} channel={i} key={'ttl-'+i+index} on={step['ttl'][i].state} sequence_name={stage.name}/>
                      ))
                    ))
                  }
                </TableRow>
              ))}
              </React.Fragment>
          ): null
        }

          </TableBody>
        </Table>
    </Box>
    </Paper>
  );
}

function mapStateToProps(state, ownProps){
  let durations = []
  let timestep_scales = []
  let macrosequence = []
  for (let stage of state['macrosequence']) {
    let newStage = {name: stage.name, sequence: state['sequences'][stage.name], reps: stage.reps}
    macrosequence.push(newStage)
  }


  return {channels: state['channels'],
          macrosequence: macrosequence,
          sequences: state['sequences']
        }
}
export default connect(mapStateToProps)(MacroTable)
