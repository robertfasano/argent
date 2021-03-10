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
import SaveButton from './SaveButton.jsx'
import MenuIcon from '@material-ui/icons/Menu';
import AddIcon from '@material-ui/icons/Add';
import CodeIcon from '@material-ui/icons/Code';
import {post} from '../utilities.js'
import {connect} from 'react-redux'
import LoadButton from './LoadButton.jsx'
import CreateIcon from '@material-ui/icons/Create';
import DeleteIcon from '@material-ui/icons/Delete';
import omitDeep from 'omit-deep-lodash'

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
    post('/submit', props.macrosequence)
    setAnchorEl(null)
  }



  function generate() {
    post('/generate', props.macrosequence)
    setAnchorEl(null)
  }


  return (
    <React.Fragment>
      <List style={flexContainer}>
        <>
        <ListItem button onClick={submit}>
          <Box mr={1} mt={0.5}>
            <PlayArrowIcon/>
          </Box>
          <Typography>Run</Typography>
        </ListItem>
        <ListItem button onClick={generate}>
          <Box mr={1} mt={0.5}>
            <CodeIcon/>
          </Box>
          <Typography>Generate</Typography>
        </ListItem>
        </>
    </List>

    </React.Fragment>
  )
}


function mapStateToProps(state, ownProps){
  // assemble macrosequence
  let inactiveTTLs = state.channels.TTL.filter(e => !state.ui.channels.TTL.includes(e))
  const macrosequence = []

  if (ownProps.tableChoice == 'master') {
    for (let stage of state['macrosequence']) {
      macrosequence.push({name: stage.name,
                          reps: stage.reps,
                          sequence:  omitDeep(state['sequences'][stage.name], ...inactiveTTLs)
                        })
    }
  }
  else {
    macrosequence.push({name: state.active_sequence, reps: 1, sequence: state.sequences[state.active_sequence]})
  }


  return {
          sequence: state['sequences'][state['active_sequence']],
          macrosequence: macrosequence,
          channels: state['channels'],
          ui: state['ui']
        }
}
export default connect(mapStateToProps)(AppMenu)
