import React from 'react'
import IconButton from '@material-ui/core/IconButton';
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import Box from '@material-ui/core/Box';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Typography from '@material-ui/core/Typography';
import LoadPopover from './LoadPopover.jsx'
import SavePopover from './SavePopover.jsx'
import MenuIcon from '@material-ui/icons/Menu';
import SaveIcon from '@material-ui/icons/Save';
import FolderOpenIcon from '@material-ui/icons/FolderOpen';
import {post} from '../utilities.js'
import {connect} from 'react-redux'

function AppMenu(props) {

  const [anchorEl, setAnchorEl] = React.useState(null)
  const open = Boolean(anchorEl)

  const [storeAnchor, setStoreAnchor] = React.useState(null)
  const [loadAnchor, setLoadAnchor] = React.useState(null)

  function handleLoadPopover(event) {
    if (!Boolean(loadAnchor)) {
      setLoadAnchor(event.currentTarget)
    }
    else {
      setLoadAnchor(null)
    }
  }

  function handleStorePopover(event) {
    if (!Boolean(storeAnchor)) {
      setStoreAnchor(event.currentTarget)
    }
    else {
      setStoreAnchor(null)
    }
  }

  function handleMenu(event) {
    if (!open) {
      setAnchorEl(event.currentTarget)
    }
    else {
      setAnchorEl(null)
    }
  }

  function submit() {
    post('/submit', props.sequence)
    setAnchorEl(null)
  }

  return (
    <React.Fragment>
      <IconButton onClick={handleMenu}>
        <MenuIcon style={{color: '#ffffff'}}/>
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        keepMounted
        open={open}
        onClose={handleMenu}
        anchorOrigin={{vertical: 'center', horizontal: 'right'}}
        transformOrigin={{vertical: 'center', horizontal: 'left'}}
        getContentAnchorEl={null}
      >
        <MenuItem onClick={submit}>
          <Box mr={1} mt={0.5}>
            <PlayArrowIcon/>
          </Box>
          <Typography>Run sequence</Typography>
        </MenuItem>
        <MenuItem onClick={handleStorePopover}>
          <Box mr={1} mt={0.5}>
            <SaveIcon/>
          </Box>
          <Typography>Save sequence</Typography>
        </MenuItem>
        <MenuItem onClick={handleLoadPopover}>
          <Box mr={1} mt={0.5}>
            <FolderOpenIcon/>
          </Box>
          <Typography>Load sequence</Typography>
        </MenuItem>
        <LoadPopover anchorEl={loadAnchor} setAnchorEl={setLoadAnchor} />
        <SavePopover anchorEl={storeAnchor} setAnchorEl={setStoreAnchor}/>
      </Menu>
    </React.Fragment>
  )
}

function mapStateToProps(state, ownProps){
  return {
          sequence: state['sequence']
        }
}
export default connect(mapStateToProps)(AppMenu)
