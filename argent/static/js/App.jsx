import React from 'react'
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import RTIOTable from './RTIOTable.jsx'
import MacroTable from './MacroTable.jsx'
import { makeStyles, useTheme } from "@material-ui/core/styles";
import {connect} from 'react-redux'
import AppMenu from './menu/AppMenu.jsx'
import IconButton from '@material-ui/core/IconButton'
import SequenceSelector from './SequenceSelector.jsx'
import Macrosequencer from './Macrosequencer.jsx'
import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';

const useStyles = makeStyles(theme => ({
  content: {
    padding: theme.spacing(3),
    // marginRight: 500
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

  const [tableChoice, setTableChoice] = React.useState('master')

  return (
    <React.Fragment>
      <AppBar position="fixed" color="primary" className={classes.appBar} style={{background: 'linear-gradient(45deg, #67001a 30%, #004e67 90%)'}}>
        <Toolbar>
          <AppMenu />
          <Typography style={{flexGrow: 1}}>  </Typography>
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
              {tableChoice == 'master'? <MacroTable/>: <RTIOTable/>}
            </Grid>
          </Grid>
        </Grid>

      </main>
    </React.Fragment>
  )
}

export default connect()(App)
