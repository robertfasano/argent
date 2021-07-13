import React from 'react'
import PropTypes from 'prop-types'
import Grid from '@material-ui/core/Grid'
import Box from '@material-ui/core/Box'
import FixedUnitInput from './FixedUnitInput.jsx'
import Select from '@material-ui/core/Select'
import MenuItem from '@material-ui/core/MenuItem'
import InputLabel from '@material-ui/core/InputLabel'
import FormControl from '@material-ui/core/FormControl'
import LinkIcon from '@material-ui/icons/Link'
import LinkOffIcon from '@material-ui/icons/LinkOff'
import IconButton from '@material-ui/core/IconButton'
import { connect } from 'react-redux'

function LinkableParameter (props) {
  const variableMode = props.value.includes('var:')

  const setVariableMode = () => {
    const firstInput = Object.keys(props.inputs)[0]
    props.onChange('var:' + firstInput)
  }

  const setConstantMode = () => {
    const currentInputValue = props.inputs[props.value.split('var:')[1]]
    props.onChange(currentInputValue)
  }
  return (
    <Box mx={1}>
      {
    variableMode
      ? (
        <Grid container>
          <Grid item xs={10}>
            <FormControl style={{ fullWidth: true, wrap: 'nowrap', margin: 0, display: 'flex' }}>
            <InputLabel shrink={true}> {props.label} </InputLabel>
            <Select label={props.label}
                    value={props.value.split('var:')[1]}
                    onChange = {(event) => props.onChange('var:' + event.target.value)}
                    autoWidth={true}
                    >
              {Object.keys(props.inputs).map((key, index) => (
                <MenuItem value={key} key={key}>
                  {key}
                </MenuItem>
              ))}
            </Select>
            </FormControl>
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
                        onChange = {(event) => props.onChange(event.target.value)}
                        unit = {props.unit}
                        label={props.label}
                        style={{ width: '100%' }}
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
  inputs: PropTypes.object,
  unit: PropTypes.string,
  label: PropTypes.string
}

export default connect()(LinkableParameter)
