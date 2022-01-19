import React from 'react'
import PropTypes from 'prop-types'
import Box from '@material-ui/core/Box'
import Typography from '@material-ui/core/Typography'
import { connect } from 'react-redux'
import ParameterGroupPanel from './ParameterGroupPanel.jsx'
import ParameterContextMenu from './ParameterContextMenu.jsx'
import Button from '@material-ui/core/Button'
import CreateNewFolderIcon from '@material-ui/icons/CreateNewFolder'

function ParameterTable (props) {
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
        <ParameterContextMenu state={menu} close={closeMenu} groups={Object.keys(props.groups)}/>
        <Box my={2}>
        <Typography>Parameters are constant unless modified within the sequence itself. During sequence playback, their values are broadcast to the Argent server at the end of each cycle.
        </Typography>
        </Box>
        <ParameterGroupPanel key={'default'} group={'default'} items={props.groups.default} handleMenu={handleMenu} expanded={expanded} setExpanded={toggleExpanded}/>
        {Object.entries(props.groups).sort().map(([key, value]) => (
          (key !== 'default') ? (<ParameterGroupPanel key={key} group={key} items={value} handleMenu={handleMenu} expanded={expanded} setExpanded={toggleExpanded}/>) : null

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

ParameterTable.propTypes = {
  sequence: PropTypes.object,
  parameters: PropTypes.object,
  groups: PropTypes.object,
  addGroup: PropTypes.func
}

function mapDispatchToProps (dispatch, props) {
  return {
    addGroup: (name) => dispatch({ type: 'parameters/addGroup', name: prompt('Enter new group name:') })
  }
}

function mapStateToProps (state, props) {
  state = state.present
  const groups = state.ui.groups.parameters
  return {
    sequence: state.sequences[state.active_sequence],
    parameters: state.parameters,
    groups: groups
  }
}
export default connect(mapStateToProps, mapDispatchToProps)(ParameterTable)
