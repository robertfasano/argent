import React from 'react'
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import RTIOTable from './RTIOTable.jsx'
import { makeStyles, useTheme } from "@material-ui/core/styles";
import {connect} from 'react-redux'
import AppMenu from './menu/AppMenu.jsx'

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


export default function App(props) {
  const classes = useStyles()

  return (
    <React.Fragment>
      <AppBar position="fixed" color="primary" className={classes.appBar} style={{background: 'linear-gradient(45deg, #67001a 30%, #004e67 90%)'}}>
        <Toolbar>
          <AppMenu />
          <Typography> ARTIQ </Typography>
        </Toolbar>
      </AppBar>
      <div className={classes.appBarSpacer} />
      <main className={classes.content}>
          <RTIOTable/>
      </main>
    </React.Fragment>
  )
}
