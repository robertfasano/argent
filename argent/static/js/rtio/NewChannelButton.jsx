import React from 'react';
import AddIcon from '@material-ui/icons/Add';
import Button from '@material-ui/core/Button';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';

import {connect} from 'react-redux'

function NewChannelButton(props) {
  const [channel, setChannel] = React.useState(props.inactiveChannels[0])


  function addChannel(ch) {
    props.dispatch({type: 'ui/setActive', channelType: props.channelType, channel: channel})
    let suggestion = props.inactiveChannels.filter(ch => ch != channel)[0]
    setChannel(suggestion)
  }

  if (!props.inactiveChannels.includes(channel)) {
    setChannel(props.inactiveChannels[0])
  }
  return (
    <TableRow>
    <TableCell>
      <Select value={channel}
              width='100%'
              onChange={(event) => setChannel(event.target.value)}
              style={{fontSize: 14}}
              >
        {props.inactiveChannels.map((name, index) => {
            return (
              <MenuItem key={name} value={name}>{props.aliases[props.channelType][name]}</MenuItem>
              )
            }
          )
        }
      </Select>
    </TableCell>
    <TableCell>
      <Button onClick={addChannel}>
        <AddIcon/>
      </Button>
    </TableCell>


    </TableRow>
)}

function mapStateToProps(state, props){
  let inactiveChannels = state.channels[props.channelType].filter(ch => !state.ui.channels[props.channelType].includes(ch))
  return {inactiveChannels: inactiveChannels,
          aliases: state.aliases
        }
}
export default connect(mapStateToProps)(NewChannelButton)
