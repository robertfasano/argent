import React from 'react'
import ReactDOM from 'react-dom'
import reducer from './js/reducers/reducer.js'
import { createStore } from 'redux'
import { Provider } from 'react-redux'
import { ThemeProvider } from '@material-ui/core'
import { createMuiTheme } from '@material-ui/core/styles';
import App from './js/App.jsx'

const cellWidth = '82px'
const cellHeight = '30px'

const theme = createMuiTheme({
  palette: {
    secondary: {main: "#67001a"},
    primary: {main: "#004e67"}
    },
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

function initializeState(channels, sequences) {
  let state = {}
  state['config'] = {'sequence_library': '', 'device_db': ''}
  state['channels'] = channels
  state['controls'] = {paused: false, latch: false}

  state['scripts'] = {}
  state['sequences'] = sequences

  if (Object.keys(state['sequences']).includes('default')) {
    console.log('Loading sequences from file.')
    state['sequence'] = state['sequences']['default']
  }
  else {
    console.log('No saved sequences found. Generating default sequence.')
    state['sequence'] = {}
    state['sequence']['duration'] = ['1']
    state['sequence']['variables'] = {}
    state['sequence']['timestep_scales'] = [1]


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
  }

  // state['active_sequence'] = 'default'

  // sequence_v2 endpoints for unnormalized sequence
  const default_timestep = {'duration': '1',
                            'ttl': {},
                            'time_scale': 1
                           }

  for (let channel of channels.TTL) {
    default_timestep['ttl'][channel] = {'state': false}
  }

  state['sequence_v2'] = [default_timestep]
  state['sequences'] = {default: [default_timestep]}
  state['active_sequence'] = 'default'
  state['macrosequence'] = [{name: 'default', reps: 1}]
  return state

}


export function createGUI(sequences, channels) {
  sequences = JSON.parse(sequences)
  const state = initializeState(channels, sequences)
  const store = createStore(reducer, state)
  ReactDOM.render(<Provider store={store}>
                    <ThemeProvider theme={theme}>
                      <App/>
                    </ThemeProvider>
                  </Provider>, document.getElementById("root"))
}
