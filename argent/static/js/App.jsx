import React from 'react'
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import RTIOTable from './RTIOTable.jsx'
import { makeStyles, useTheme } from "@material-ui/core/styles";
import {connect} from 'react-redux'
import AppMenu from './menu/AppMenu.jsx'
import SettingsIcon from '@material-ui/icons/Settings';
import IconButton from '@material-ui/core/IconButton'
import ConfigPopover from './ConfigPopover.jsx'
import io from 'socket.io-client'

const useStyles = makeStyles(theme => ({
  content: {
    padding: theme.spacing(3),
    marginRight: 500
  },
  appBar: {
    minHeight: 36
  },
  appBarSpacer: theme.mixins.toolbar
}));


function App(props) {
  const classes = useStyles()

  const [configAnchor, setConfigAnchor] = React.useState(null)
  function handleConfigPopover(event) {
    if (!Boolean(configAnchor)) {
      setConfigAnchor(event.currentTarget)
    }
    else {
      setConfigAnchor(null)
    }
  }

  const socket = io('http://localhost:8051');
  socket.on('connect', (data) => {
    console.log('connected to socketIO link')
  })

  socket.on('variables', (data) => {
    props.dispatch({type: 'variables/update', data: data})
  })

  return (
    <React.Fragment>
      <AppBar position="fixed" color="primary" className={classes.appBar} style={{background: 'linear-gradient(45deg, #67001a 30%, #004e67 90%)'}}>
        <Toolbar>
          <AppMenu />
          <Typography style={{flexGrow: 1}}>  </Typography>
          <IconButton onClick={(event) => handleConfigPopover(event)}>
            <SettingsIcon style={{color: 'white'}}/>
          </IconButton>
          <ConfigPopover anchorEl={configAnchor} setAnchorEl={setConfigAnchor} />
        </Toolbar>
      </AppBar>
      <div className={classes.appBarSpacer} />
      <main className={classes.content}>
          <RTIOTable/>
      </main>
    </React.Fragment>
  )
}

export default connect()(App)
