import React from 'react';
import {connect} from 'react-redux'
import Select from '@material-ui/core/Select';
import Box from '@material-ui/core/Box';
import Popover from '@material-ui/core/Popover';
import MenuItem from '@material-ui/core/MenuItem';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import AddIcon from '@material-ui/icons/Add';
import IconButton from '@material-ui/core/IconButton';
import DoneIcon from '@material-ui/icons/Done';
import TextField from '@material-ui/core/TextField';
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
import Button from '@material-ui/core/Button';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormLabel from '@material-ui/core/FormLabel';

function VariablePopover(props) {
  const open = Boolean(props.anchorEl)

  const [nameFieldAnchor, setNameFieldAnchor] = React.useState(null)
  const [newVariableType, setNewVariableType] = React.useState('float')
  const [newName, setNewName] = React.useState('')
  const [newVariableValue, setNewVariableValue] = React.useState('')
  const [radioType, setRadioType] = React.useState('Data')

  function addVariable() {
    let type = 'variables/add'
    if (Object.keys(props.variables).includes(newName)) {
      type = 'variables/edit'
    }
    props.dispatch({type: type,
                    name: newName,
                    value: newVariableValue,
                    kind: radioType,
                    datatype: newVariableType})

    setNameFieldAnchor(null)

    setNewName('')
    setNewVariableValue('')
    setNewVariableType('float')
  }

  function updateName(event) {
    event.stopPropagation()
    event.preventDefault()
    setNewName(event.target.value)
  }

  function updateType(event) {
    event.stopPropagation()
    event.preventDefault()
    setNewVariableType(event.target.value)
  }

  function updateValue(event) {
    event.stopPropagation()
    event.preventDefault()
    setNewVariableValue(event.target.value)
  }

  const types = ['float', 'int', 'bool']

  function editVariable(event, name) {
    setNameFieldAnchor(event.currentTarget)
    console.log(event, name, props.variables[name])
    setNewName(name)

    setNewVariableType(props.variables[name].datatype)
    setRadioType(props.variables[name].kind)
    setNewVariableValue(props.variables[name]['value'])
  }

  let variableLabels = {}
  for (name in props.variables) {
    if (props.variables[name].kind == 'Data') {
      variableLabels[name] = name + ' (data)'
    }
    else {
      variableLabels[name] = name + ' (' + props.variables[name].datatype + ', ' + props.variables[name].value + ')'
    }
  }
  return (
    <React.Fragment>
      <Popover
        open={open}
        anchorEl={props.anchorEl}
        onClose={(event) => props.setAnchorEl(null)}
        anchorOrigin={{vertical: 'bottom', horizontal: 'left'}}
        transformOrigin={{vertical: 'top', horizontal: 'left'}}
      >
        <List>
          {Object.keys(props.variables).map(name => (
            <ListItem button key={name} value={name} onClick={(event) => editVariable(event, name)}>
              <ListItemText primary={variableLabels[name]} />
            </ListItem>
          ))}
          <ListItem button>
            <ListItemIcon onClick={(event) => setNameFieldAnchor(event.currentTarget)}>
              <AddIcon/>
            </ListItemIcon>
          </ListItem>
        </List>
      </Popover>
      <Popover
        open={Boolean(nameFieldAnchor)}
        anchorEl={nameFieldAnchor}
        onClose={(event) => setNameFieldAnchor(null)}
        anchorOrigin={{vertical: 'top', horizontal: 'right'}}
        transformOrigin={{vertical: 'top', horizontal: 'left'}}
      >
      <Box m={1}>
        <FormControl component="fieldset">
          <RadioGroup row value={radioType} onChange={(event) => setRadioType(event.target.value)}>
            <FormControlLabel value="Data" control={<Radio />} label="Data" />
            <FormControlLabel value="Input" control={<Radio />} label="Input" />
            <FormControlLabel value="Output" control={<Radio />} label="Output" />
          </RadioGroup>
        </FormControl>
      </Box>
      <Box m={1}>
          <TextField onChange = {updateName}
                     value = {newName}
                     variant = "outlined"
                     size = "small"
                     label="Name"
                     InputLabelProps = {{shrink: true}}
          />
        </Box>
        {['Input', 'Output'].includes(radioType)? (
          <React.Fragment>
            <Box m={1}>
              <TextField onChange = {updateValue}
                         value = {newVariableValue}
                         variant = "outlined"
                         size = "small"
                         label="Value"
                         InputLabelProps = {{shrink: true}}
              />
            </Box>
            <Box m={1}>
              <FormControl>
                <InputLabel id='type-select'> Type </InputLabel>
                <Select value={newVariableType}
                        variant='outlined'
                        labelId='type-select'
                        onChange={updateType}
                >
                  {types.map(name => (
                    <MenuItem key={name} value={name}>{name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </React.Fragment>
        ): null}

      <Box m={1}>
        <Button variant="text" onClick={addVariable}> Confirm </Button>
      </Box>
      </Popover>
    </React.Fragment>
  )
}

function mapStateToProps(state, ownProps) {
  return {variables: state['sequence'].variables
        }
}
export default connect(mapStateToProps)(VariablePopover)
