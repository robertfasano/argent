import ttl from './ttl.js'
import timing from './timing.js'
import channels from './channels.js'
import { combineReducers } from 'redux'

const reducer = combineReducers({ttl, timing, channels})
export default reducer
