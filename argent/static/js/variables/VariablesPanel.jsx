import React from 'react'
import PropTypes from 'prop-types'
import Box from '@material-ui/core/Box'
import { connect } from 'react-redux'
import Tabs from '@material-ui/core/Tabs'
import Tab from '@material-ui/core/Tab'
import ParameterTable from './ParameterTable.jsx'
import VariableTable from './VariableTable.jsx'
import { selectPresentState } from '../selectors'

function VariablesPanel (props) {
  return (
    <>
      <Tabs value={props.variableTab} onChange={(event, newValue) => props.changeVariableTab(newValue)} variant="fullWidth">
        <Tab key="Variables" label="Variables" value="Variables" style={{ textTransform: 'none' }}/>
        <Tab key="Parameters" label="Parameters" value="Parameters" style={{ textTransform: 'none' }}/>
      </Tabs>
      <Box m={2}>
          {
          props.variableTab === 'Parameters'
            ? (
              <ParameterTable/>
              )
            : props.variableTab === 'Variables'
              ? (
                <VariableTable/>
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
  state = selectPresentState(state)
  return {
    variableTab: state.ui.variableTab
  }
}
export default connect(mapStateToProps, mapDispatchToProps)(VariablesPanel)
