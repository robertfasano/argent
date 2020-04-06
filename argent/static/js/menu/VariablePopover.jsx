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
    let kind = radioType == 'Script'? newVariableType: 'data'
    props.dispatch({type: 'variables/add',
                    name: newName,
                    value: newVariableValue,
                    kind: kind})
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

  const types = ['float', 'int']

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
          {props.variables.map(v => (
            <ListItem button key={v.name}>
              <ListItemText primary={v.name} />
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
        anchorOrigin={{vertical: 'center', horizontal: 'right'}}
        transformOrigin={{vertical: 'center', horizontal: 'left'}}
      >
      <Box m={1}>
        <FormControl component="fieldset">
          <RadioGroup row value={radioType} onChange={(event) => setRadioType(event.target.value)}>
            <FormControlLabel value="Data" control={<Radio />} label="Data" />
            <FormControlLabel value="Script" control={<Radio />} label="Script" />
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
        {radioType == 'Script'? (
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
        <Button variant="text" onClick={addVariable}> Add </Button>
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
