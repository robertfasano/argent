import React from 'react';
import Button from '@material-ui/core/Button';
import TableCell from '@material-ui/core/TableCell';
import {connect} from 'react-redux'

function TTLButton(props) {
  function toggle() {
    if (props.reserved) {
      return
    }
    props.dispatch({type: 'ttl/toggle',
                    timestep: props.timestep,
                    channel: props.channel,
                    sequence_name: props.sequence_name})
  }

  return (
    <TableCell component="th" scope="row" key={props.timestep}>
      <Button variant="contained"
              disableRipple={true}
              style={{backgroundColor: props.on? '#ffff00': '#D3D3D3', opacity: props.reserved? 0.15: 1}}
              onClick={() => toggle()}
              >
      <React.Fragment/>
      </Button>
    </TableCell>
)}

function mapStateToProps(state, ownProps){
  return {
          // on: state['sequence']['ttl'][ownProps.channel][ownProps.timestep].state,
          // reserved: state['sequence']['ttl'][ownProps.channel][ownProps.timestep].reserved
          // on: state['sequence_v2'][ownProps.timestep]['ttl'][ownProps.channel].state,
          // on: state['sequences'][state['active_sequence']][ownProps.timestep]['ttl'][ownProps.channel].state
          // reserved: false
        }
}
export default connect(mapStateToProps)(TTLButton)
