import React from 'react'
import PropTypes from 'prop-types'
import Box from '@material-ui/core/Box'
import { connect } from 'react-redux'
import Tabs from '@material-ui/core/Tabs'
import Tab from '@material-ui/core/Tab'
import OutputsTable from './OutputsTable.jsx'
import InputsTable from './InputsTable.jsx'

function VariablesPanel (props) {
  return (
    <>
      <Tabs value={props.variableTab} onChange={(event, newValue) => props.changeVariableTab(newValue)} variant="fullWidth">
        <Tab key="Inputs" label="Inputs" value="Inputs" style={{ textTransform: 'none' }}/>
        <Tab key="Outputs" label="Outputs" value="Outputs" style={{ textTransform: 'none' }}/>
      </Tabs>
      <Box m={2}>
          {
          props.variableTab === 'Outputs'
            ? (
              <OutputsTable/>
              )
            : props.variableTab === 'Inputs'
              ? (
                <InputsTable/>
                )
              : null
          }
      </Box>
    </>
  )
}

VariablesPanel.propTypes = {
  variableTab: PropTypes.string,
  changeVariableTab: PropTypes.func
}

function mapDispatchToProps (dispatch) {
  return {
    changeVariableTab: (name) => dispatch({ type: 'ui/changeVariableTab', name: name })
  }
}

function mapStateToProps (state) {
  return {
    variableTab: state.ui.variableTab
  }
}
export default connect(mapStateToProps, mapDispatchToProps)(VariablesPanel)
