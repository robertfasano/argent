import React from 'react'
import PropTypes from 'prop-types'
import Grid from '@material-ui/core/Grid'
import Box from '@material-ui/core/Box'
import FixedUnitInput from './FixedUnitInput.jsx'
import LinkIcon from '@material-ui/icons/Link'
import TextField from '@material-ui/core/TextField'
import LinkOffIcon from '@material-ui/icons/LinkOff'
import IconButton from '@material-ui/core/IconButton'
import Autocomplete from '@mui/material/Autocomplete'
import { connect } from 'react-redux'
import { selectPresentState, selectVariableGroups } from '../selectors'

function LinkableParameter (props) {
  const variableMode = String(props.value).includes('self.')

  const setVariableMode = () => {
    const firstInput = props.variables[0]
    props.onChange('self.' + firstInput)
  }

  const setConstantMode = () => {
    const currentInputValue = props.variables[props.value.split('self.')[1]] || ''
    props.onChange(currentInputValue)
  }

  const [inputValue, setInputValue] = React.useState('')

  const options = []
  const groups = {}
  for (const [group, vars] of Object.entries(props.groups)) {
    for (const name of vars.slice().sort()) { // slice is used to create a new array to allow sorting
      options.push(name)
      groups[name] = group
    }
  }

  function onChange (newValue) {
    if (newValue == null) {
      props.onChange('')
    } else props.onChange('self.' + newValue)
  }

  return (
    <Box mx={1}>
      {
    variableMode
      ? (
        <Grid container>
          <Grid item xs={10}>
            <Autocomplete options={options}
            value={props.value.split('self.')[1]}
            renderInput={(params) => <TextField {...params} label={props.label} />}
            onChange = {(event, newValue) => onChange(newValue)}
            inputValue={inputValue}
            groupBy={(option) => groups[option]}
            onInputChange={(event, newInputValue) => {
              setInputValue(newInputValue)
            }}
            style={{ width: '250px' }}
            />
          </Grid>
          <Grid item xs={2}>
            <Box mt={1}>
              <IconButton onClick={setConstantMode}>
                <LinkIcon/>
              </IconButton>
            </Box>
          </Grid>
        </Grid>
        )
      : (
        <Grid container>
          <Grid item xs={10}>
            <FixedUnitInput value={props.value}
                        onChange = {(value) => props.onChange(value)}
                        unit = {props.unit}
                        label={props.label}
                        style={{ width: '250px' }}
            />
          </Grid>
          <Grid item xs={2}>
            <Box mt={1}>
              <IconButton onClick={setVariableMode}>
                <LinkOffIcon/>
              </IconButton>
            </Box>
          </Grid>
        </Grid>
        )
        }
    </Box>

  )
}

LinkableParameter.propTypes = {
  onChange: PropTypes.func,
  value: PropTypes.string,
  variables: PropTypes.array,
  unit: PropTypes.string,
  label: PropTypes.string,
  groups: PropTypes.object
}

function mapStateToProps (state) {
  state = selectPresentState(state)

  return {
    groups: selectVariableGroups(state),
    variables: Object.keys(state.variables)
  }
}

export default connect(mapStateToProps)(LinkableParameter)
