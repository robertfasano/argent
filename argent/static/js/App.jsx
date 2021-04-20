import React from 'react'
import AppBar from '@material-ui/core/AppBar'
import Toolbar from '@material-ui/core/Toolbar'
import Typography from '@material-ui/core/Typography'
import SequenceTable from './SequenceTable.jsx'
import VariableTable from './VariableTable.jsx'
import ArgumentTable from './ArgumentTable.jsx'
import { makeStyles } from '@material-ui/core/styles'
import { connect } from 'react-redux'
import AppMenu from './menu/AppMenu.jsx'
import SequenceSelector from './SequenceSelector.jsx'
import Grid from '@material-ui/core/Grid'
import Paper from '@material-ui/core/Paper'
import Heartbeat from './menu/Heartbeat.jsx'
import io from 'socket.io-client'
import { get } from './utilities.js'
import PropTypes from 'prop-types'

const useStyles = makeStyles(theme => ({
  content: {
    padding: theme.spacing(3)
  },
  appBar: {
    minHeight: 36
  },
  appBarSpacer: theme.mixins.toolbar
}))

function App (props) {
  const classes = useStyles()

  React.useEffect(() => {
    const socket = io()
    socket.on('connect', (data) => {
      console.log('Connected to socketIO link')
    })

    socket.on('heartbeat', (data) => {
      props.dispatch({ type: 'ui/heartbeat', pid: data.pid })
      get('/results', (result) => {
        props.dispatch({ type: 'variables/output/update', variables: result.outputs })
      })
    })
  },
  [])

  return (
    <React.Fragment>

      <AppBar position="fixed" color="primary" className={classes.appBar} style={{ background: 'linear-gradient(45deg, #67001a 30%, #004e67 90%)' }}>
        <Toolbar>
          <AppMenu/>
          <Typography style={{ flexGrow: 1 }}>  </Typography>
          <Heartbeat/>
        </Toolbar>
      </AppBar>

      <div className={classes.appBarSpacer} />

      <main className={classes.content}>
        <Grid container item xs={12} spacing={2} justify='space-evenly'>
          <Grid item xs={12}>
            <SequenceSelector/>
          </Grid>
            <Grid item>
              <Paper elevation={6} style={{ minWidth: '350px' }}>
                <ArgumentTable/>
                <VariableTable/>
              </Paper>
            </Grid>
          <Grid item xl lg md sm xs>
            <SequenceTable />
          </Grid>
        </Grid>
      </main>
    </React.Fragment>
  )
}

App.propTypes = {
  dispatch: PropTypes.func
}

export default connect()(App)
