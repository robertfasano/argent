import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import Menu from '@material-ui/core/Menu'
import MenuItem from '@material-ui/core/MenuItem'
import NestedMenuItem from 'material-ui-nested-menu-item'

function InputContextMenu (props) {
  return (
    <Menu
      anchorEl={props.state.anchor}
      open={props.open}
      onClose={props.close}
    >
      <MenuItem onClick={() => props.deleteInput()}>
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

InputContextMenu.propTypes = {
  state: PropTypes.object,
  open: PropTypes.bool,
  close: PropTypes.func,
  deleteInput: PropTypes.func,
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
    deleteInput: () => {
      dispatch({ type: 'variables/input/delete', name: props.state.name })
      props.close()
    },
    changeGroup: (group) => {
      dispatch({ type: 'variables/input/changeGroup', name: props.state.name, group: group })
      props.close()
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(InputContextMenu)
