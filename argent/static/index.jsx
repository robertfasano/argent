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

export function defaultSequence(channels) {
  const default_timestep = {'duration': '1',
                            'ttl': {},
                            'time_scale': 1
                           }

  for (let channel of channels.TTL) {
    default_timestep['ttl'][channel] = {'state': false}
  }

  return [default_timestep]
}

function initializeState(channels, sequences) {
  let state = {}
  state['channels'] = channels
  state['sequences'] = sequences



  state['sequences'] = {'New sequence': defaultSequence(channels)}
  state['active_sequence'] = 'New sequence'
  state['macrosequence'] = [{name: 'New sequence', reps: 1}]
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
