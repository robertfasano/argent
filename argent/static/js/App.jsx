import React from 'react'
import AppBar from '@material-ui/core/AppBar'
import Toolbar from '@material-ui/core/Toolbar'
import Typography from '@material-ui/core/Typography'
import SequenceTable from './sequencing/SequenceTable.jsx'
import VariablesPanel from './variables/VariablesPanel.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import { makeStyles } from '@material-ui/core/styles'
import { connect } from 'react-redux'
import SequenceSelector from './tabs/SequenceSelector.jsx'
import PlaylistPanel from './playlists/PlaylistPanel.jsx'
import Grid from '@material-ui/core/Grid'
import Box from '@material-ui/core/Box'
import Paper from '@material-ui/core/Paper'
import Heartbeat from './appbar/Heartbeat.jsx'
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
        props.dispatch({ type: 'parameters/update', parameters: result.parameters, sequence: result.sequence })
      })
    })
  },
  [])

  return (
    <React.Fragment>

      <AppBar position="fixed" color="primary" className={classes.appBar} style={{ background: 'linear-gradient(45deg, #67001a 30%, #004e67 90%)' }}>
        <Toolbar>
          <Typography style={{ flexGrow: 1 }}>  </Typography>
          <Heartbeat/>
        </Toolbar>
      </AppBar>

      <div className={classes.appBarSpacer} />

      <main className={classes.content}>
        <Grid container>
          <Grid item>
            <Box mx={2}>
              <Paper elevation={6} style={{ width: '400px' }}>
                <ErrorBoundary>
                  <VariablesPanel/>
                </ErrorBoundary>
              </Paper>
              <Paper elevation={6} style={{ width: '400px' }}>
                <ErrorBoundary>
                  <PlaylistPanel/>
                </ErrorBoundary>
              </Paper>
            </Box>
          </Grid>

          <Grid item xs>
              <Grid container direction='column'>
                <Grid item>
                  <Box mb={2}>
                    <ErrorBoundary>
                      <SequenceSelector/>
                    </ErrorBoundary>
                  </Box>
                </Grid>
                <Grid item>
                  <ErrorBoundary>
                    <SequenceTable />
                  </ErrorBoundary>
                </Grid>
              </Grid>
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
