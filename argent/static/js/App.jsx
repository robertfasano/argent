import React from 'react'
import AppBar from '@material-ui/core/AppBar'
import Toolbar from '@material-ui/core/Toolbar'
import Typography from '@material-ui/core/Typography'
import SequenceTable from './SequenceTable.jsx'
import { makeStyles } from '@material-ui/core/styles'
import { connect } from 'react-redux'
import AppMenu from './menu/AppMenu.jsx'
import SequenceSelector from './SequenceSelector.jsx'
import Grid from '@material-ui/core/Grid'
import Heartbeat from './menu/Heartbeat.jsx'
import io from 'socket.io-client'
import { get } from './utilities.js'
const useStyles = makeStyles(theme => ({
  content: {
    padding: theme.spacing(3)
    // marginRight: 500
  },
  appBar: {
    minHeight: 36
  },
  appBarSpacer: theme.mixins.toolbar
}))

function App (props) {
  const classes = useStyles()
  const [tableChoice, setTableChoice] = React.useState('master')

  React.useEffect(() => {
    const socket = io();
    socket.on('connect', (data) => {
      console.log('Connected to socketIO link')
    })

    socket.on('heartbeat', (data) => {      
      props.dispatch({type: 'ui/heartbeat', pid: data.pid})
      get('/variables', (result) => {
        props.dispatch({type: 'variables/update', variables: result})
      })
    })
  },
  [])


  return (
    <React.Fragment>

      <AppBar position="fixed" color="primary" className={classes.appBar} style={{ background: 'linear-gradient(45deg, #67001a 30%, #004e67 90%)' }}>
        <Toolbar>
          <AppMenu tableChoice={tableChoice}/>
          <Typography style={{ flexGrow: 1 }}>  </Typography>
          <Heartbeat/>
        </Toolbar>
      </AppBar>
      <div className={classes.appBarSpacer} />

      <main className={classes.content}>
        <Grid container spacing={2}>
          <Grid container item xs={12} direction='column' spacing={2} justify='space-evenly'>
            <Grid item xs={12}>
              <SequenceSelector tableChoice={tableChoice} setTableChoice={setTableChoice}/>
            </Grid>
            <Grid item xs={12}>
              <SequenceTable tableChoice={tableChoice} />
            </Grid>
          </Grid>
        </Grid>

      </main>
    </React.Fragment>
  )
}

export default connect()(App)
