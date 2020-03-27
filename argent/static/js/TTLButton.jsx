import React from 'react';
import Button from '@material-ui/core/Button';
import TableCell from '@material-ui/core/TableCell';
import {connect} from 'react-redux'

function TTLButton(props) {
  function toggle() {
    props.dispatch({type: 'ttl/toggle',
                    timestep: props.timestep,
                    channel: props.channel})
  }

  return (
    <TableCell component="th" scope="row" key={props.timestep}>
      <Button variant="contained"
              disableRipple={true}
              style={{backgroundColor: props.on? '#ffff00': '#D3D3D3'}}
              onClick={() => toggle()}
              >
      <React.Fragment/>
      </Button>
    </TableCell>
)}

function mapStateToProps(state, ownProps){
  return {
          on: state['ttl'][ownProps.channel][ownProps.timestep]
        }
}
export default connect(mapStateToProps)(TTLButton)
