import React from 'react';
import Button from '@material-ui/core/Button';
import Popover from '@material-ui/core/Popover';
import TableCell from '@material-ui/core/TableCell';
import Grid from '@material-ui/core/Grid'
import Box from '@material-ui/core/Box'
import Select from '@material-ui/core/Select'
import MenuItem from '@material-ui/core/MenuItem'
import FormControl from '@material-ui/core/FormControl'
import FormLabel from '@material-ui/core/FormLabel'

import {gradient} from './colors.js'
import {connect} from 'react-redux'
import {get} from './utilities.js'

function ScriptButton(props) {
  const [anchorEl, setAnchorEl] = React.useState(null)
  const open = Boolean(anchorEl);

  let scripts = props.scripts

  let functions = {}
  if (props.module != '') {
    functions = scripts[props.module]
  }
  function loadScripts() {
    get('/scripts/list', (scripts) => props.dispatch({
      type: 'scripts/list',
      scripts: scripts
    }))
  }

  function clear() {
    setModule('')

    props.dispatch({type: 'scripts/function',
                    timestep: props.timestep,
                    value: ''
                  })

    props.dispatch({type: 'scripts/reserved',
                    timestep: props.timestep,
                    value: {'adc': [], 'dac': [], 'dds': [], 'ttl': []}
                  })
  }

  function setModule(name) {
    props.dispatch({type: 'scripts/module',
                    timestep: props.timestep,
                    value: name
                  })
  }

  function setFunction(name) {
    props.dispatch({type: 'scripts/function',
                    timestep: props.timestep,
                    value: name
                  })

    setReserved(name)
  }

  function setReserved(name) {
    let devs = functions[name].reserved

    for (let adc of props.channels.ADC) {
      props.dispatch({type: 'adc/reserve',
                      timestep: props.timestep,
                      channel: adc,
                      value: devs.adc.includes(adc)
                    })
    }

    for (let dac of props.channels.DAC) {
      props.dispatch({type: 'dac/reserve',
                      timestep: props.timestep,
                      channel: dac,
                      value: devs.dac.includes(dac.charAt(0))
                    })
    }

    for (let dds of props.channels.DDS) {
      props.dispatch({type: 'dds/reserve',
                      timestep: props.timestep,
                      channel: dds,
                      value: devs.dds.includes(dds)
                    })
    }

    for (let ttl of props.channels.TTL) {
      props.dispatch({type: 'ttl/reserve',
                      timestep: props.timestep,
                      channel: ttl,
                      value: devs.ttl.includes(ttl)
                    })
    }


  }

  React.useEffect(loadScripts, [])



  return (
    <TableCell component="th" scope="row" key={props.timestep}>
      <Button variant="contained"
              style={{backgroundColor: props.function != ''? '#004e67': '#D3D3D3'}}
              disableRipple={true}
              onClick={(event) => setAnchorEl(event.currentTarget)}
              > <div/>
      </Button>
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={(event) => setAnchorEl(null)}
        anchorOrigin={{vertical: 'bottom', horizontal: 'right'}}
        transformOrigin={{vertical: 'top', horizontal: 'left'}}
      >

        <Box m={1}>
          <FormControl component="fieldset">
            <FormLabel component="legend">Module</FormLabel>
          <Select value={props.module}
                  autoWidth
                  onChange={(event) => setModule(event.target.value)}>
            {Object.keys(scripts).map(name => (
              <MenuItem key={name} value={name}> {name} </MenuItem>
            ))}
          </Select>
          </FormControl>
        </Box>
        <Box m={1}>
          <FormControl component="fieldset">
            <FormLabel component="legend">Function</FormLabel>
          <Select value={props.function}
                  autoWidth
                  onChange={(event) => setFunction(event.target.value)}>
            {Object.keys(functions).map(name => (
              <MenuItem key={name} value={name}> {name} </MenuItem>
            ))}
          </Select>
          </FormControl>
        </Box>
      <Button variant="text" onClick={clear}> Clear </Button>
      </Popover>
    </TableCell>
)}

function mapStateToProps(state, ownProps){
  return {scripts: state['scripts'],
          module: state['sequence']['script'][ownProps.timestep]['module'],
          function: state['sequence']['script'][ownProps.timestep]['function'],
          reserved: state['sequence']['script'][ownProps.timestep]['reserved'],
          channels: state['channels']
        }
}
export default connect(mapStateToProps)(ScriptButton)
