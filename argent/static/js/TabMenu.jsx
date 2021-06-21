import React from 'react'
import PropTypes from 'prop-types'
import Menu from '@material-ui/core/Menu'
import MenuItem from '@material-ui/core/MenuItem'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import ListItemText from '@material-ui/core/ListItemText'
import CreateIcon from '@material-ui/icons/Create'
import DeleteIcon from '@material-ui/icons/Delete'
import SaveIcon from '@material-ui/icons/Save'
import AddIcon from '@material-ui/icons/Add'
import omitDeep from 'omit-deep-lodash'
import yaml from 'js-yaml'
import { connect } from 'react-redux'

function TabMenu (props) {
  // A context menu for the SequenceSelector allowing sequences to be renamed,
  // closed, or saved.
  const text = '# Created with Argent commit ' + props.version + '\n' + yaml.dump(props.sequence)
  return (
    <Menu
        anchorEl={props.anchorEl}
        open={props.open}
        onClose={() => props.setAnchorEl(null)}
        anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
        transformOrigin={{ horizontal: 'left', vertical: 'top' }}
        getContentAnchorEl={null}
      >
      <MenuItem onClick={props.rename}>
        <ListItemIcon>
          <CreateIcon fontSize="small" />
        </ListItemIcon>
        <ListItemText primary="Rename" />
      </MenuItem>
      <MenuItem onClick={props.delete}>
        <ListItemIcon>
          <DeleteIcon fontSize="small" />
        </ListItemIcon>
        <ListItemText primary="Close" />
      </MenuItem>
      <MenuItem button component="a"
                  href={`data:text/json;charset=utf-8,${encodeURIComponent(text)}`}
                  download={`${props.name}.yml`}
      >
        <ListItemIcon>
          <SaveIcon fontSize="small" />
        </ListItemIcon>
        <ListItemText primary="Save" />
      </MenuItem>
      <MenuItem onClick={props.addToMacrosequence}>
        <ListItemIcon>
          <AddIcon fontSize="small" />
        </ListItemIcon>
        <ListItemText primary="Add to macrosequence" />
      </MenuItem>
    </Menu>
  )
}

TabMenu.propTypes = {
  name: PropTypes.string,
  sequence: PropTypes.object,
  setAnchorEl: PropTypes.func,
  anchorEl: PropTypes.object,
  open: PropTypes.bool,
  rename: PropTypes.func,
  delete: PropTypes.func,
  addToMacrosequence: PropTypes.func,
  version: PropTypes.string
}

function mapDispatchToProps (dispatch, props) {
  return {
    rename: () => {
      const newName = prompt('Enter new sequence name:')
      dispatch({ type: 'sequence/rename', name: props.name, newName: newName })
      props.setAnchorEl(null)
    },
    delete: () => {
      dispatch({ type: 'sequence/close', name: props.name })
      props.setAnchorEl(null)
    },
    addToMacrosequence: () => {
      dispatch({ type: 'macrosequence/append', sequence: { name: props.name, reps: 1 } })
      props.setAnchorEl(null)
    }
  }
}

function mapStateToProps (state, props) {
  const inactiveTTLs = state.channels.TTL.filter(ch => !state.ui.channels.TTL.includes(ch))
  const inactiveDDS = state.channels.DDS.filter(ch => !state.ui.channels.DDS.includes(ch))
  let inactiveDACs = []
  for (const board of Object.keys(state.channels.DAC)) {
    inactiveDACs = [...inactiveDACs, ...state.channels.DAC[board].filter(e => !state.ui.channels.DAC[board].includes(e))]
  }
  const inactiveChannels = [...inactiveTTLs, ...inactiveDDS, ...inactiveDACs]
  const sequence = { ...state.sequences[props.name], steps: omitDeep(state.sequences[props.name].steps, ...inactiveChannels) }
  sequence.inputs = state.inputs
  sequence.outputs = state.outputs
  return {
    sequence: sequence,
    version: state.version,
    open: Boolean(props.anchorEl) && (props.anchorName === props.name)
  }
}
export default connect(mapStateToProps, mapDispatchToProps)(TabMenu)
