import React from 'react'
import ReactDOM from 'react-dom'
import TTL from './js/TTL.jsx'
import reducer from './js/reducers/reducer.js'
import { createStore } from 'redux'
import { Provider } from 'react-redux'

export function createGUI(parameters) {
  const state = {'ttl': [[0], [1]],
                 'timing': [0.4, 0.007],
                 'channels': {'TTL': [0, 1, 2, 3]}
               }
  const store = createStore(reducer, state)
  ReactDOM.render(<Provider store={store}><TTL/></Provider>, document.getElementById("root"))
}
