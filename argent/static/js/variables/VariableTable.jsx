import React from 'react'
import PropTypes from 'prop-types'
import Box from '@material-ui/core/Box'
import Typography from '@material-ui/core/Typography'
import { connect } from 'react-redux'
import VariableGroupPanel from './VariableGroupPanel.jsx'
import VariableContextMenu from './VariableContextMenu.jsx'
import Button from '@material-ui/core/Button'
import CreateNewFolderIcon from '@material-ui/icons/CreateNewFolder'

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
        <VariableContextMenu state={menu} close={closeMenu} groups={Object.keys(props.groups)}/>
        <Box my={2}>
          <Typography>Variables are synchronized from the server to the experiment at the end of each experimental cycle.
          </Typography>
        </Box>
        <VariableGroupPanel key={'default'} group={'default'} items={props.groups.default} handleMenu={handleMenu} expanded={expanded} setExpanded={toggleExpanded}/>
        {Object.entries(props.groups).sort().map(([key, value]) => (
          (key !== 'default') ? (<VariableGroupPanel key={key} group={key} items={value} handleMenu={handleMenu} expanded={expanded} setExpanded={toggleExpanded}/>) : null

        ))
        }
        <Box py={1}>
          <Button onClick={props.addGroup} style={{ textTransform: 'none', width: 150 }}>
            <CreateNewFolderIcon/>
            <Box px={2}>New group</Box>
          </Button>
        </Box>
        </>
  )
}

VariableTable.propTypes = {
  variables: PropTypes.object,
  groups: PropTypes.object,
  addGroup: PropTypes.func
}

function mapDispatchToProps (dispatch, props) {
  return {
    addGroup: (name) => dispatch({ type: 'variables/addGroup', name: prompt('Enter new group name:') })
  }
}

function mapStateToProps (state, props) {
  const groups = state.sequences[state.active_sequence].ui.groups.variables

  return {
    variables: state.variables,
    groups: groups
  }
}
export default connect(mapStateToProps, mapDispatchToProps)(VariableTable)
