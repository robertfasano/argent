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

function RTIOTable(props) {
  const [expanded, setExpanded] = React.useState({'ttl': true, 'dac': true, 'dds': true, 'adc': true, 'script': true})

  function expand(name) {
    setExpanded({...expanded, [name]: !expanded[name]})
  }

  function updateTimestep(timestep, duration) {
    props.dispatch({type: 'timestep/duration', timestep: timestep, duration: duration, sequence_name: props.sequence_name})
  }

  function setScale(timestep, value) {
    props.dispatch({type: 'timestep/scale', timestep: timestep, value: value, sequence_name: props.sequence_name})
  }

  return (
    <Paper elevation={6} style={{overflowX: 'auto'}}>
    <Box px={2} style={{display: "inline-block"}}>
        <Table>
          <TableHead>
            {/* timestep control icons */}
            <TableRow>
              <TableCell/>
            </TableRow>
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
                  <ScaledInput value={step.duration}
                                 onChange = {(value) => updateTimestep(index, value)}
                                 units = {{'s': 1, 'ms': 1e-3, 'us': 1e-6}}
                                 scale = {props.sequence[index].time_scale}
                                 setScale = {(value) => setScale(index, value)}
                  />
                </TableCell>
              ))}
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
                  {props.sequence.map((step, index) => (
                    <TTLButton timestep={index} channel={i} key={'ttl-'+i+index} on={props.sequence[index]['ttl'][i].state}/>
                  ))}

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
  let sequence = state['sequences'][state['active_sequence']]


  return {channels: state['channels'],
          sequence: sequence,
          sequence_name: state['active_sequence']
        }
}
export default connect(mapStateToProps)(RTIOTable)
