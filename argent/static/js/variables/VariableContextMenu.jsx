import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import Menu from '@material-ui/core/Menu'
import MenuItem from '@material-ui/core/MenuItem'
import NestedMenuItem from 'material-ui-nested-menu-item'

function VariableContextMenu (props) {
  function createNewGroup () {
    const name = prompt('Enter new group name:')
    props.changeGroup(name)
  }

  return (
    <Menu
      anchorEl={props.state.anchor}
      open={Boolean(props.state.anchor)}
      onClose={props.close}
    >
      <MenuItem onClick={() => props.deleteVariable()}>
        Delete
      </MenuItem>
      <NestedMenuItem
          label="Move to"
          parentMenuOpen={Boolean(props.state.anchor)}
        >

      {props.groups.sort().map(group => (
        <MenuItem key={group} onClick={() => props.changeGroup(group)}>
            {group}
        </MenuItem>))
        }
        <MenuItem key={'__new__'} onClick={createNewGroup}>New group</MenuItem>

      </NestedMenuItem>
    </Menu>
  )
}

VariableContextMenu.propTypes = {
  state: PropTypes.object,
  open: PropTypes.bool,
  close: PropTypes.func,
  deleteVariable: PropTypes.func,
  changeGroup: PropTypes.func,
  groups: PropTypes.array
}

function mapStateToProps (state) {
  return {}
}

function mapDispatchToProps (dispatch, props) {
  return {
    deleteVariable: () => {
      dispatch({ type: 'variables/delete', name: props.state.name })
      props.close()
    },
    changeGroup: (group) => {
      dispatch({ type: 'variables/changeGroup', name: props.state.name, group: group })
      props.close()
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(VariableContextMenu)
