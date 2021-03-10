import React from 'react'
import ReactDOM from 'react-dom'
import reducer from './js/reducers/reducer.js'
import {compose, createStore } from 'redux'
import persistState from 'redux-localstorage'
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

export function defaultSequence(channels) {
  const default_timestep = {'duration': '1 s',
                            'ttl': {},
                            'dac': {},
                            'time_scale': 1
                           }

  for (let channel of channels.TTL) {
    default_timestep['ttl'][channel] = false
  }

  for (let board of Object.keys(channels.DAC)) {
    // default_timestep['dac'][board] = Array(32).fill('')
    default_timestep['dac'][board] = {}
  }

  return [default_timestep]
}

function prepareAliases(channels, aliases) {
  // Prepare the display names of channels by merging user inputs from config.yml
  // with default channel names
  let mergedAliases = {'TTL': {}, 'DAC': {}}
  for (let ch of channels.TTL) {
    mergedAliases.TTL[ch] = aliases.ttl[ch] || ch
  }

  for (let board of Object.keys(channels.DAC)) {
    mergedAliases.DAC[board] = {}
    for (let ch of channels.DAC[board]) {
      mergedAliases.DAC[board][ch] = aliases.dac[board][ch] || board+ch
    }
  }

  return mergedAliases
}
function initializeState(channels, sequences, aliases) {
  let state = {}
  state['channels'] = channels
  state['sequences'] = sequences
  state['sequences'] = {'new sequence': defaultSequence(channels)}
  state['active_sequence'] = 'new sequence'
  state['macrosequence'] = [{name: 'new sequence', reps: 1}]

  let activeDACChannels = {}
  for (let board of Object.keys(state.channels.DAC)) {
    activeDACChannels[board] = []
  }
  state['ui'] = {hideInactive: false, channels: {'TTL': ['ttlA0'], 'DAC': state.channels.DAC}}
  state['aliases'] = prepareAliases(channels, aliases)
  return state

}


export function createGUI(sequences, channels, aliases) {
  sequences = JSON.parse(sequences)
  const state = initializeState(channels, sequences, aliases)
  console.log('initializeState:', state)
  const enhancer = compose(persistState(['sequences', 'channels', 'active_sequence', 'macrosequence', 'ui']))
  const store = createStore(reducer, state, enhancer)
  // const store = createStore(reducer, state)

  ReactDOM.render(<Provider store={store}>
                    <ThemeProvider theme={theme}>
                      <App/>
                    </ThemeProvider>
                  </Provider>, document.getElementById("root"))
}
