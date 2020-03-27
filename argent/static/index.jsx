import React from 'react'
import ReactDOM from 'react-dom'
import TTL from './js/TTL.jsx'
import reducer from './js/reducers/reducer.js'
import { createStore } from 'redux'
import { Provider } from 'react-redux'
import { ThemeProvider } from '@material-ui/core'
import { createMuiTheme } from '@material-ui/core/styles';

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

function initialState(channels) {
  const state = {'duration': '1',
                 'ttl': {},
                 'dac': {},
                 'dds': {},
                 'adc': {}
               }
  for (let channel of channels.TTL) {
    state['ttl'][channel] = false
  }
  for (let channel of channels.DAC) {
    state['dac'][channel] = {'mode': 'constant', 'setpoint': '', 'start': '', 'stop': ''}
  }
  for (let channel of channels.DDS) {
    state['dds'][channel] = {'attenuation': {'mode': 'constant', 'setpoint': '', 'start': '', 'stop': ''},
                               'frequency': {'mode': 'constant', 'setpoint': '', 'start': '', 'stop': ''},
                               'on': false
                              }
  }
  for (let channel of channels.ADC) {
    state['adc'][channel] = {'samples': '',
                             'on': false
                              }
  }
  return {'sequence': [state], 'channels': channels, 'timestep_scales': [1]}
}

export function createGUI(parameters) {
  const channels =  {'TTL': [0, 1, 2, 3],
               'DAC': [0, 1],
               'DDS': [0, 1],
               'ADC': [0]}

  const state = initialState(channels)

  const store = createStore(reducer, state)
  ReactDOM.render(<Provider store={store}>
                    <ThemeProvider theme={theme}>
                      <TTL/>
                    </ThemeProvider>
                  </Provider>, document.getElementById("root"))
}
