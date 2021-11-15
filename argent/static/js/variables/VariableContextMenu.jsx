import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import Menu from '@material-ui/core/Menu'
import MenuItem from '@material-ui/core/MenuItem'
import NestedMenuItem from 'material-ui-nested-menu-item'

function VariableContextMenu (props) {
  return (
    <Menu
      anchorEl={props.state.anchor}
      open={props.open}
      onClose={props.close}
    >
      <MenuItem onClick={() => props.deleteVariable()}>
        Delete
      </MenuItem>
      <NestedMenuItem
          label="Move to"
          parentMenuOpen={props.open}
        >

      {props.groups.sort().map(group => (
        <MenuItem key={group} onClick={() => props.changeGroup(group)}>
            {group}
        </MenuItem>))
        }

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

function mapStateToProps (state, props) {
  return {
    open: Boolean(props.state.anchor)
  }
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