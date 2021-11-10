import React from 'react'
import PropTypes from 'prop-types'
import Box from '@material-ui/core/Box'
import Typography from '@material-ui/core/Typography'
import { connect } from 'react-redux'
import OutputGroupPanel from './OutputGroupPanel.jsx'
import OutputContextMenu from './OutputContextMenu.jsx'
import Button from '@material-ui/core/Button'
import CreateNewFolderIcon from '@material-ui/icons/CreateNewFolder'

function OutputsTable (props) {
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
        <OutputContextMenu state={menu} close={closeMenu} groups={Object.keys(props.groups)}/>
        <Box my={2}>
        <Typography>Output variables are used to store values extracted from ADC measurements. During sequence playback, their values are broadcast to the Argent server at the end of each cycle.
        </Typography>
        </Box>
        <OutputGroupPanel key={'default'} group={'default'} items={props.groups.default} handleMenu={handleMenu} expanded={expanded} setExpanded={toggleExpanded}/>
        {Object.entries(props.groups).sort().map(([key, value]) => (
          (key !== 'default') ? (<OutputGroupPanel key={key} group={key} items={value} handleMenu={handleMenu} expanded={expanded} setExpanded={toggleExpanded}/>) : null

        ))
        }
        <Button onClick={props.addGroup} style={{ textTransform: 'none', width: 150 }}>
        <CreateNewFolderIcon/>
        <Box px={2}>New group</Box>
        </Button>

        </>
  )
}

OutputsTable.propTypes = {
  sequence: PropTypes.object,
  outputs: PropTypes.object,
  groups: PropTypes.object,
  addGroup: PropTypes.func
}

function mapDispatchToProps (dispatch, props) {
  return {
    addGroup: (name) => dispatch({ type: 'variables/output/addGroup', name: prompt('Enter new group name:') })
  }
}

function mapStateToProps (state, props) {
  const groups = state.sequences[state.active_sequence].ui.groups.output
  return {
    sequence: state.sequences[state.active_sequence],
    outputs: state.outputs,
    groups: groups
  }
}
export default connect(mapStateToProps, mapDispatchToProps)(OutputsTable)
