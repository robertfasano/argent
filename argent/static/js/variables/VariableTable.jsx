import React from 'react'
import PropTypes from 'prop-types'
import Box from '@material-ui/core/Box'
import Typography from '@material-ui/core/Typography'
import { connect } from 'react-redux'
import VariableGroupPanel from './VariableGroupPanel.jsx'
import VariableContextMenu from './VariableContextMenu.jsx'
import { selectPresentState, selectVariableGroups } from '../selectors'

function VariableTable (props) {
  const [menu, setMenu] = React.useState({ anchor: null, name: null })
  const [expanded, setExpanded] = React.useState(Object.keys(props.groups))

  function toggleExpanded (name) {
    if (expanded.includes(name)) {
      setExpanded(expanded.filter(x => x !== name))
    } else {
      setExpanded([...expanded, name])
    }
  }

  function handleMenu (event, name, group) {
    event.preventDefault()
    setMenu({ anchor: event.currentTarget, name: name })
  }

  function closeMenu () {
    setMenu({ anchor: null, index: null })
  }

  return (
        <>
        <Box p={2}>
        <Typography style={{ fontSize: 24 }}> <b>Variables</b> </Typography>
        <VariableContextMenu state={menu} close={closeMenu} groups={Object.keys(props.groups)}/>
        <Box mt={2}>
          <VariableGroupPanel key={'default'} group={'default'} items={props.groups.default} handleMenu={handleMenu} expanded={expanded} setExpanded={toggleExpanded}/>
        </Box>
        {Object.entries(props.groups).sort().map(([key, value]) => (
          (key !== 'default') ? (<VariableGroupPanel key={key} group={key} handleMenu={handleMenu} expanded={expanded} setExpanded={toggleExpanded}/>) : null

        ))
        }
        </Box>
        </>
  )
}

VariableTable.propTypes = {
  groups: PropTypes.object
}

function mapDispatchToProps (dispatch, props) {
  return {
  }
}

function mapStateToProps (state, props) {
  state = selectPresentState(state)
  return {
    groups: selectVariableGroups(state)
  }
}
export default connect(mapStateToProps, mapDispatchToProps)(VariableTable)
