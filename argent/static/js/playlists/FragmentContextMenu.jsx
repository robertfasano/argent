import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import Menu from '@material-ui/core/Menu'
import MenuItem from '@material-ui/core/MenuItem'
import NestedMenuItem from 'material-ui-nested-menu-item'
import { selectPresentState } from '../selectors'

function FragmentContextMenu (props) {
  return (
    <Menu
      anchorEl={props.anchor}
      open={Boolean(props.anchor)}
      onClose={props.close}
    >
      <NestedMenuItem
          label="Move to"
          parentMenuOpen={Boolean(props.anchor)}
        >

      {props.stages.map(stage => (
        <MenuItem key={stage} onClick={() => props.moveToStage(stage)}>
            {stage}
        </MenuItem>))
        }

      </NestedMenuItem>
    </Menu>
  )
}

FragmentContextMenu.propTypes = {
  stages: PropTypes.array,
  anchor: PropTypes.object,
  close: PropTypes.func,
  moveToStage: PropTypes.func,
  menuState: PropTypes.object
}

function mapStateToProps (state, props) {
  state = selectPresentState(state)
  return {
    stages: [...state.playlist.keys()]
  }
}

function mapDispatchToProps (dispatch, props) {
  return {
    moveToStage: (stage) => {
      dispatch({ type: 'playlist/changeStage', currentStage: props.menuState.stage, targetStage: stage, currentFragment: props.menuState.fragment })
      props.close()
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(FragmentContextMenu)
