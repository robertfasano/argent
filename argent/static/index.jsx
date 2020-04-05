import React from 'react'
import ReactDOM from 'react-dom'
import RTIOTable from './js/RTIOTable.jsx'
import SequenceSelector from './js/SequenceSelector.jsx'
import reducer from './js/reducers/reducer.js'
import { createStore } from 'redux'
import { Provider } from 'react-redux'
import { ThemeProvider } from '@material-ui/core'
import { createMuiTheme } from '@material-ui/core/styles';
import { makeStyles, useTheme } from "@material-ui/core/styles";

import Macrosequencer from './js/Macrosequencer.jsx'
import AppBar from '@material-ui/core/AppBar';
import Grid from '@material-ui/core/Grid';

import Paper from '@material-ui/core/Paper';

import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';

const cellWidth = '82px'
const cellHeight = '30px'

const theme = createMuiTheme({
    overrides: {
        MuiTableCell: {
            root: {  //This can be referred from Material UI API documentation.
                width: cellWidth,
                height: cellHeight,
                minWidth: cellWidth,
                minHeight: cellHeight,
                borderBottom: false,
                padding: '2px 2px 2px 2px'
            },
        },
        MuiButton: {
          root: {
            padding: 'none',
            width: cellWidth,
            height: cellHeight,
          }
        }
    },
});

function initializeState(channels) {
  let state = {}
  state['scripts'] = {}
  state['sequence'] = {}
  state['sequence']['duration'] = ['1']
  state['sequence']['timestep_scales'] = [1]
  state['channels'] = channels

  state['sequence']['script'] = [{'module': '', 'function': ''}]
  state['sequence']['ttl'] = {}
  for (let channel of channels.TTL) {
    state['sequence']['ttl'][channel] = [{'state': false,
                                          'reserved': false}]
  }

  state['sequence']['dac'] = {}
  for (let channel of channels.DAC) {
    state['sequence']['dac'][channel] = [{'mode': 'constant',
                                   'setpoint': '',
                                   'start': '',
                                   'stop': '',
                                   'reserved': '',
                                   'steps': '10'
                                 }]
  }

  state['sequence']['dds'] = {}
  for (let channel of channels.DDS) {
    state['sequence']['dds'][channel] = [{'attenuation': {'mode': 'constant',
                                                   'setpoint': '',
                                                   'start': '',
                                                   'stop': '',
                                                   'steps': '10'
                                                  },
                                    'frequency': {'mode': 'constant',
                                                  'setpoint': '',
                                                  'start': '',
                                                  'stop': '',
                                                  'steps': '10'
                                                 },
                                    'on': false,
                                    'reserved': false
                                  }]
  }

  state['sequence']['adc'] = {}
  for (let channel of channels.ADC) {
    state['sequence']['adc'][channel] = [{'samples': '',
                                   'on': false,
                                   'variable': '',
                                   'reserved': false,
                                 }]
  }

  state['sequences'] = {'default': state['sequence']}
  state['active_sequence'] = 'default'

  return state

}

const useStyles = makeStyles(theme => ({
  content: {
    padding: theme.spacing(3),
    marginRight: 500
  },
  drawer: {
    width: 500,
    flexShrink: 0,
  },
  drawerPaper: {
    width: 500,
    paddingTop: 64 // equal to AppBar height
  },
  appBar: {
    zIndex: theme.zIndex.drawer + 1
  },

  appBarSpacer: theme.mixins.toolbar
}));

function App(props) {
  const classes = useStyles()

  return (
    <React.Fragment>
      <AppBar position="fixed" color="primary" className={classes.appBar}>
        <Toolbar>
          <Typography variant="h6" style={{ flex: 1 }}>
            ARTIQ
          </Typography>
        </Toolbar>
      </AppBar>
      <div className={classes.appBarSpacer} />
      <main className={classes.content}>
        <Paper style={{width: '100%', overflow: 'auto'}}>
          <div>
            <Typography variant='h6' align='center'> Sequence Editor </Typography>
          </div>
          <SequenceSelector/>
          <RTIOTable/>
        </Paper>
        <Macrosequencer classes={classes}/>
      </main>
    </React.Fragment>
  )
}
export function createGUI(parameters) {
  const channels =  {'TTL': ['A0', 'A1', 'A2', 'A3'],
               'DAC': ['A0', 'A1'],
               'DDS': ['A0', 'A1'],
               'ADC': ['A']}

  const state = initializeState(channels)

  const store = createStore(reducer, state)
  console.log(state)
  ReactDOM.render(<Provider store={store}>
                    <ThemeProvider theme={theme}>
                      <RTIOTable/>
                    </ThemeProvider>
                  </Provider>, document.getElementById("root"))
}
