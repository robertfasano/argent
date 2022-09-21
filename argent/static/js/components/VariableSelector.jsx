import React from 'react'
import Autocomplete from '@mui/material/Autocomplete'
import PropTypes from 'prop-types'
import TextField from '@material-ui/core/TextField'
import { connect } from 'react-redux'
import { selectPresentState, selectVariableGroups } from '../selectors'

function VariableSelector (props) {
    const [inputValue, setInputValue] = React.useState('')
    const options = []
    const groups = {}
    for (const [group, vars] of Object.entries(props.groups)) {
      for (const name of vars.slice().sort()) { // slice is used to create a new array to allow sorting
        options.push(name)
        groups[name] = group
      }
    }
    return (
        <Autocomplete options={options}
            value={props.value}
            renderInput={(params) => <TextField {...params} label={props.label} />}
            onChange = {(event, newValue) => props.onChange(newValue)}
            inputValue={inputValue}
            groupBy={(option) => groups[option]}
            onInputChange={(event, newInputValue) => {
            setInputValue(newInputValue)
            }}
            style={{ width: '250px' }}
        />
    )
}

VariableSelector.propTypes = {
    value: PropTypes.string,
    label: PropTypes.string,
    groups: PropTypes.object,
    onChange: PropTypes.func
  }
  
function mapStateToProps (state) {
    state = selectPresentState(state)
  
    return {
      groups: selectVariableGroups(state),
      variables: Object.keys(state.variables)
    }
  }
  
  export default connect(mapStateToProps)(VariableSelector)
