import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography'
import IconButton from '@material-ui/core/IconButton';
import {connect} from 'react-redux'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ExpandLessIcon from '@material-ui/icons/ExpandLess';
import TTLButton from './rtio/TTLButton.jsx'
import ScaledInput from './components/ScaledInput.jsx'
import MacroContextMenu from './MacroContextMenu.jsx'
import Button from '@material-ui/core/Button';
import AddIcon from '@material-ui/icons/Add';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import VisibilityButton from './VisibilityButton.jsx'

function MacroTable(props) {
  const [expanded, setExpanded] = React.useState({'ttl': true, 'dac': true, 'dds': true, 'adc': true, 'script': true})

  function add() {
    props.dispatch({type: 'macrosequence/append', sequence: props.macrosequence[props.macrosequence.length-1]})
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
            <TableCell>
              <VisibilityButton/>
            </TableCell>
            {
              props.macrosequence.map((stage, i) => (
              <TableCell key={i} colSpan={stage.sequence.length} align='center'>
                <List style={{        display: 'flex',
                        flexDirection: 'row',
                        padding: 0}}>
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
                {stage.reps>1?
                <ListItem>
                <Typography>
                  {`(x${stage.reps})`}
                </Typography>
                </ListItem>
                : null }
                </List>
              </TableCell>
              ))

            }
            </TableRow>
            <TableRow>
              <TableCell/>
              {
                props.macrosequence.map((stage, index) => (
                    <MacroContextMenu colSpan={stage.sequence.length} timestep={index} length={props.macrosequence.length} key={index} sequence_name={stage.name}/>
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
                        <TTLButton timestep={index} channel={i} key={'ttl-'+i+index} on={step['ttl'][i]} sequence_name={stage.name}/>
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


  return {channels: state.ui['channels'],
          macrosequence: macrosequence,
          sequences: state['sequences']
        }
}
export default connect(mapStateToProps)(MacroTable)
