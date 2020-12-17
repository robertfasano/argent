import React from 'react'
import IconButton from '@material-ui/core/IconButton';
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import PauseIcon from '@material-ui/icons/Pause';
import PauseCircleFilledIcon from '@material-ui/icons/PauseCircleFilled';
import Box from '@material-ui/core/Box';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import Typography from '@material-ui/core/Typography';
import LoadPopover from './LoadPopover.jsx'
import SaveButton from './SaveButton.jsx'
import VariablePopover from './VariablePopover.jsx'
import MenuIcon from '@material-ui/icons/Menu';
import AddIcon from '@material-ui/icons/Add';
import CodeIcon from '@material-ui/icons/Code';
import {post} from '../utilities.js'
import {connect} from 'react-redux'
import PauseButton from './PauseButton.jsx'
import LoadButton from './LoadButton.jsx'

function AppMenu(props) {
  const flexContainer = {
    display: 'flex',
    flexDirection: 'row',
    padding: 0,
  };

  const [anchorEl, setAnchorEl] = React.useState(null)
  const open = Boolean(anchorEl)

  const [storeAnchor, setStoreAnchor] = React.useState(null)
  const [loadAnchor, setLoadAnchor] = React.useState(null)
  const [variableAnchor, setVariableAnchor] = React.useState(null)

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

  function handleVariablePopover(event) {
    if (!Boolean(variableAnchor)) {
      setVariableAnchor(event.currentTarget)
    }
    else {
      setVariableAnchor(null)
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



  function generate() {
    post('/generate', props.sequence)
    setAnchorEl(null)
  }


  return (
    <React.Fragment>
      <List style={flexContainer}>
        <ListItem button onClick={submit}>
          <Box mr={1} mt={0.5}>
            <PlayArrowIcon/>
          </Box>
          <Typography>Run</Typography>
        </ListItem>
        <PauseButton />
        <ListItem button onClick={generate}>
          <Box mr={1} mt={0.5}>
            <CodeIcon/>
          </Box>
          <Typography>Generate</Typography>
        </ListItem>
        <SaveButton/>
        <LoadButton/>
        <ListItem button onClick={handleVariablePopover}>
          <Box mr={1} mt={0.5}>
            <AddIcon/>
          </Box>
          <Typography>Variables</Typography>
        </ListItem>
        <LoadPopover anchorEl={loadAnchor} setAnchorEl={setLoadAnchor} />
        <VariablePopover anchorEl={variableAnchor} setAnchorEl={setVariableAnchor}/>

      </List>
    </React.Fragment>
  )
}

function mapStateToProps(state, ownProps){
  return {
          sequence: state['sequence']
        }
}
export default connect(mapStateToProps)(AppMenu)
