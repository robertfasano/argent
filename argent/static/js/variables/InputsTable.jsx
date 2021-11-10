import React from 'react'
import PropTypes from 'prop-types'
import Box from '@material-ui/core/Box'
import Typography from '@material-ui/core/Typography'
import { connect } from 'react-redux'
import InputGroupPanel from './InputGroupPanel.jsx'
import InputContextMenu from './InputContextMenu.jsx'
import Button from '@material-ui/core/Button'
import CreateNewFolderIcon from '@material-ui/icons/CreateNewFolder'

function InputsTable (props) {
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
        <InputContextMenu state={menu} close={closeMenu} groups={Object.keys(props.groups)}/>
        <Box my={2}>
          <Typography>Input variables can be used to define a single value across multiple sequences for DAC voltages or DDS frequencies. During sequence playback,
            inputs are updated from the Argent server at the end of each cycle, allowing values to be changed while the sequence is running.
          </Typography>
        </Box>
        <InputGroupPanel key={'default'} group={'default'} items={props.groups.default} handleMenu={handleMenu} expanded={expanded} setExpanded={toggleExpanded}/>
        {Object.entries(props.groups).sort().map(([key, value]) => (
          (key !== 'default') ? (<InputGroupPanel key={key} group={key} items={value} handleMenu={handleMenu} expanded={expanded} setExpanded={toggleExpanded}/>) : null

        ))
        }
          <Button onClick={props.addGroup} style={{ textTransform: 'none', width: 150 }}>
          <CreateNewFolderIcon/>
          <Box px={2}>New group</Box>
          </Button>
        </>
  )
}

InputsTable.propTypes = {
  sequence: PropTypes.object,
  inputs: PropTypes.object,
  groups: PropTypes.object,
  addGroup: PropTypes.func
}

function mapDispatchToProps (dispatch, props) {
  return {
    addGroup: (name) => dispatch({ type: 'variables/input/addGroup', name: prompt('Enter new group name:') })
  }
}

function mapStateToProps (state, props) {
  const groups = state.sequences[state.active_sequence].ui.groups.input
  return {
    sequence: state.sequences[state.active_sequence],
    inputs: state.inputs,
    groups: groups
  }
}
export default connect(mapStateToProps, mapDispatchToProps)(InputsTable)
