import React from 'react'
import ReactDOM from 'react-dom'
import reducer from './js/reducers/reducer.js'
import { compose, createStore } from 'redux'
import persistState from 'redux-localstorage'
import { Provider } from 'react-redux'
import { ThemeProvider } from '@material-ui/core'
import App from './js/App.jsx'
import theme from './theme.js'
import defaultSequence from './js/schema.js'

function initializeState (channels, sequences, version) {
  const state = {}
  state.channels = channels
  state.sequences = sequences
  state.sequences = { 'new sequence': { steps: defaultSequence(channels) } }
  state.active_sequence = 'new sequence'
  state.playlist = [{ name: 'new sequence', reps: 1 }]
  state.inputs = {}
  state.outputs = {}

  state.ui = {
    heartbeat: false,
    pid: { active: null, submitted: null },
    variableTab: 'Inputs'
  }

  state.version = version
  return state
}

export function createGUI (sequences, channels, version) {
  sequences = JSON.parse(sequences)
  const state = initializeState(channels, sequences, version)
  const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose
  const enhancer = composeEnhancers(persistState(['sequences', 'active_sequence', 'playlist', 'ui', 'inputs', 'outputs']))
  const store = createStore(reducer, state, enhancer)

  ReactDOM.render(<Provider store={store}>
                    <ThemeProvider theme={theme}>
                      <App/>
                    </ThemeProvider>
                  </Provider>, document.getElementById('root'))
}
