import React from 'react'
import ReactDOM from 'react-dom'
import RTIOTable from './js/RTIOTable.jsx'
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

function initializeState(channels) {
  let state = {}
  state['sequence'] = {'ttl': {}, 'dac': {}, 'dds': {}, 'adc': {}}
  state['sequence']['duration'] = ['1']
  state['sequence']['timestep_scales'] = [1]
  state['channels'] = channels

  for (let channel of channels.TTL) {
    state['sequence']['ttl'][channel] = [false]
  }

  for (let channel of channels.DAC) {
    state['sequence']['dac'][channel] = [{'mode': 'constant',
                                   'setpoint': '',
                                   'start': '',
                                   'stop': ''
                                 }]
  }

  for (let channel of channels.DDS) {
    state['sequence']['dds'][channel] = [{'attenuation': {'mode': 'constant',
                                                   'setpoint': '',
                                                   'start': '',
                                                   'stop': ''
                                                  },
                                    'frequency': {'mode': 'constant',
                                                  'setpoint': '',
                                                  'start': '',
                                                  'stop': '',
                                                 },
                                    'on': false
                                  }]
  }

  for (let channel of channels.ADC) {
    state['sequence']['adc'][channel] = [{'samples': '',
                                   'on': false
                                 }]
  }

  state['sequences'] = {'default': state['sequence']}
  state['active_sequence'] = 'default'

  return state

}

export function createGUI(parameters) {
  const channels =  {'TTL': [0, 1, 2, 3],
               'DAC': [0, 1],
               'DDS': [0, 1],
               'ADC': [0, 1]}

  const state = initializeState(channels)

  const store = createStore(reducer, state)
  ReactDOM.render(<Provider store={store}>
                    <ThemeProvider theme={theme}>
                      <TTL/>
                      <RTIOTable/>
                    </ThemeProvider>
                  </Provider>, document.getElementById("root"))
}
