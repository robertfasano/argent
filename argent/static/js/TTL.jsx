import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography'
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import {connect} from 'react-redux'
import {actions} from './reducers/reducer.js'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ExpandLessIcon from '@material-ui/icons/ExpandLess';
import TextField from '@material-ui/core/TextField';
import TTLButton from './TTLButton.jsx'
import DACButton from './DACButton.jsx'
import DDSButton from './DDSButton.jsx'
import ADCButton from './ADCButton.jsx'
import AddIcon from '@material-ui/icons/Add';
import ScaledInput from './ScaledInput.jsx'

import TimestepContextMenu from './TimestepContextMenu.jsx'

function TTLTable(props) {
  const [expanded, setExpanded] = React.useState({'ttl': true, 'dac': true, 'dds': true, 'adc': true})

  function expand(name) {
    setExpanded({...expanded, [name]: !expanded[name]})
  }

  function updateTimestep(index, dt) {
    props.dispatch(actions.timing.update(index, dt))
  }

  function setScale(index, value) {
    props.dispatch(actions.scale.update(index, value))
  }

  return (
    <div style={{display: 'inline-block'}}>
      <TableContainer>
        <Table>
          <TableHead>
            {/* timestep control icons */}
            <TableRow>
              <TableCell />
              {props.state.map((i, index) => (
                <TimestepContextMenu index={index} length={props.state.length} key={index}/>
              ))}
            </TableRow>
            {/* timesteps row */}
            <TableRow>
              <TableCell/>
              {props.state.map((i, index) => (
                <TableCell key={index}>
                  <ScaledInput value={props.state[index]['duration']}
                                 onChange = {(value) => updateTimestep(index, value)}
                                 units = {{'s': 1, 'ms': 1e-3, 'us': 1e-6}}
                                 scale = {props.timestep_scales[index]}
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
                  <TableCell> TTL{i} </TableCell>
                  {props.state.map((t, index) => (
                    <TTLButton timestep={index} channel={i} key={'ttl-'+i+index}/>
                  ))}

                </TableRow>
              ))}
              </React.Fragment>
          ): null
        }


        <TableRow>
          <TableCell>
            <IconButton onClick={()=>expand('dac')} >
              {expanded['dac']?
              <ExpandLessIcon/>: <ExpandMoreIcon /> }
            </IconButton>
          </TableCell>
          <TableCell><Typography> <b> DAC </b> </Typography></TableCell>
        </TableRow>
        {expanded['dac']? (
        <React.Fragment>
        {props.channels.DAC.map(i => (
          <TableRow key={i}>
            <TableCell> DAC{i} </TableCell>
            {props.state.map((t, index) => (
              <DACButton timestep={index} channel={i} key={'dac-'+i+index}/>
            ))}
          </TableRow>
        ))}
        </React.Fragment>
      ): null
      }

      <TableRow>
        <TableCell>
          <IconButton onClick={()=>expand('dds')} >
            {expanded['dds']?
            <ExpandLessIcon/>: <ExpandMoreIcon /> }
          </IconButton>
        </TableCell>
        <TableCell><Typography> <b> DDS </b> </Typography></TableCell>
      </TableRow>
      {expanded['dds']? (
        <React.Fragment>
        {props.channels.DDS.map(i => (
          <TableRow key={i}>
            <TableCell> DDS{i} </TableCell>
            {props.state.map((t, index) => (
              <DDSButton timestep={index} channel={i} key={'dds-'+i+index}/>
            ))}
          </TableRow>
        ))}
        </React.Fragment>
      ): null
    }

    <TableRow>
      <TableCell>
        <IconButton onClick={()=>expand('adc')} >
          {expanded['adc']?
          <ExpandLessIcon/>: <ExpandMoreIcon /> }
        </IconButton>
      </TableCell>
      <TableCell><Typography> <b> ADC </b> </Typography></TableCell>
    </TableRow>
    {expanded['adc']? (
    <React.Fragment>
    {props.channels.ADC.map(i => (
      <TableRow key={i}>
        <TableCell> ADC{i} </TableCell>
        {props.state.map((t, index) => (
          <ADCButton timestep={index} channel={i} key={'adc-'+i+index}/>
        ))}
      </TableRow>
    ))}
    </React.Fragment>
  ): null
  }
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
}

function mapStateToProps(state, ownProps){
  return {channels: state['channels'],
          state: state['sequence'],
          timestep_scales: state['timestep_scales']
        }
}
export default connect(mapStateToProps)(TTLTable)
