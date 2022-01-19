import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import Menu from '@material-ui/core/Menu'
import MenuItem from '@material-ui/core/MenuItem'
import NestedMenuItem from 'material-ui-nested-menu-item'

function ParameterContextMenu (props) {
  return (
    <Menu
      anchorEl={props.state.anchor}
      open={Boolean(props.state.anchor)}
      onClose={props.close}
    >
      <MenuItem onClick={() => props.deleteParameter()}>
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

ParameterContextMenu.propTypes = {
  state: PropTypes.object,
  close: PropTypes.func,
  deleteParameter: PropTypes.func,
  changeGroup: PropTypes.func,
  groups: PropTypes.array
}

function mapStateToProps (state, props) {
  return {
  }
}

function mapDispatchToProps (dispatch, props) {
  return {
    deleteParameter: () => {
      dispatch({ type: 'parameters/delete', name: props.state.name })
      props.close()
    },
    changeGroup: (group) => {
      dispatch({ type: 'parameters/changeGroup', name: props.state.name, group: group })
      props.close()
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(ParameterContextMenu)
