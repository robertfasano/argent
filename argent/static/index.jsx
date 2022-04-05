import React from 'react'
import ReactDOM from 'react-dom'
import reducer from './js/reducer.js'
import { compose, createStore } from 'redux'
import { Provider } from 'react-redux'
import { ThemeProvider } from '@material-ui/core'
import App from './js/App.jsx'
import theme from './js/theme.js'
import defaultSequence from './js/schema.js'
import undoable, { excludeAction } from 'redux-undo'
import { persistStore, persistReducer } from 'redux-persist'
import storage from 'redux-persist/lib/storage'
import { PersistGate } from 'redux-persist/integration/react'

function defaultStore (channels, sequences) {
  const state = {}
  state.channels = channels
  state.sequences = sequences
  state.sequences = { 'new sequence': { steps: defaultSequence(channels), script: { preparation: null, analysis: null } } }
  state.active_sequence = 'new sequence'
  state.playlist = []
  state.variables = {}

  state.ui = {
    heartbeat: false,
    pid: { active: null, submitted: null }
  }

  return state
}

export function createGUI (sequences, channels) {
  sequences = JSON.parse(sequences)
  const state = defaultStore(channels, sequences)
  const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose
  const enhancer = composeEnhancers()
  const persistConfig = {
    key: 'root',
    storage
  }
  const undoableReducer = undoable(reducer, { limit: 10, filter: excludeAction(['ui/heartbeat', 'variables/current']) })
  const persistedReducer = persistReducer(persistConfig, undoableReducer)

  const store = createStore(persistedReducer, state, enhancer)
  const persistor = persistStore(store)

  ReactDOM.render(<Provider store={store}>
                    <PersistGate loading={null} persistor={persistor}>
                      <ThemeProvider theme={theme}>
                        <App/>
                      </ThemeProvider>
                    </PersistGate>
                  </Provider>, document.getElementById('root'))
}
