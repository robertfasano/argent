import React from 'react'
import ReactDOM from 'react-dom'
import reducer from './js/reducers/reducer.js'
import { compose, createStore } from 'redux'
import persistState from 'redux-localstorage'
import { Provider } from 'react-redux'
import { ThemeProvider } from '@material-ui/core'
import App from './js/App.jsx'
import { range } from './js/utilities.js'
import theme from './theme.js'

export function defaultSequence (channels) {
  const defaultTimestep = {
    duration: '1 s',
    ttl: {},
    dac: {},
    dds: {},
    adc: {}
  }

  for (const channel of channels.TTL) {
    defaultTimestep.ttl[channel] = false
  }

  for (const board of Object.keys(channels.DAC)) {
    defaultTimestep.dac[board] = {}
    for (const ch of range(32)) {
      defaultTimestep.dac[board][board + ch] = { mode: 'constant', constant: ' V', ramp: { start: ' V', stop: ' V', steps: 100 }, variable: '' }
    }
  }

  for (const ch of channels.DDS) {
    defaultTimestep.dds[ch] = { enable: false }
  }

  for (const board of channels.ADC) {
    defaultTimestep.adc[board] = { enable: false, variables: {}, delay: '0 s', samples: 1, duration: '1 s' }
  }

  return [defaultTimestep]
}

function prepareAliases (channels, aliases) {
  // Prepare the display names of channels by merging user inputs from config.yml
  // with default channel names
  const mergedAliases = { TTL: {}, DAC: {}, DDS: {} }

  aliases.ttl = aliases.ttl || {}
  for (const ch of channels.TTL) {
    mergedAliases.TTL[ch] = aliases.ttl[ch] || ch
  }

  aliases.dac = aliases.dac || {}
  for (const board of Object.keys(channels.DAC)) {
    mergedAliases.DAC[board] = {}
    for (const ch of channels.DAC[board]) {
      mergedAliases.DAC[board][ch] = aliases.dac[board][ch] || ch
    }
  }

  aliases.dds = aliases.dds || {}
  for (const ch of channels.DDS) {
    mergedAliases.DDS[ch] = aliases.dds[ch] || ch
  }

  return mergedAliases
}

function initializeState (channels, sequences, aliases, version) {
  const state = {}
  state.channels = channels
  state.sequences = sequences
  state.sequences = { 'new sequence': { steps: defaultSequence(channels), inputs: {}, arguments: {}, outputs: {} } }
  state.active_sequence = 'new sequence'
  state.macrosequence = [{ name: 'new sequence', reps: 1 }]

  const activeDACChannels = {}
  for (const board of Object.keys(state.channels.DAC)) {
    activeDACChannels[board] = []
  }

  state.ui = {
    channels: {
      TTL: [],
      DAC: activeDACChannels,
      DDS: [],
      ADC: state.channels.ADC
    },
    heartbeat: false,
    pid: { active: null, submitted: null }
  }

  state.aliases = prepareAliases(channels, aliases)
  state.version = version
  return state
}

export function createGUI (sequences, channels, aliases, version) {
  sequences = JSON.parse(sequences)
  const state = initializeState(channels, sequences, aliases, version)
  const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose
  const enhancer = composeEnhancers(persistState(['sequences', 'channels', 'active_sequence', 'macrosequence', 'ui']))
  const store = createStore(reducer, state, enhancer)

  ReactDOM.render(<Provider store={store}>
                    <ThemeProvider theme={theme}>
                      <App/>
                    </ThemeProvider>
                  </Provider>, document.getElementById('root'))
}
