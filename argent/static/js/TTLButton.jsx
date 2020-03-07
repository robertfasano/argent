import React from 'react';
import Button from '@material-ui/core/Button';
import TableCell from '@material-ui/core/TableCell';
import {connect} from 'react-redux'
import {actions} from './reducers/reducer.js'

function TTLButton(props) {
  function toggle() {
    props.dispatch(actions.ttl.toggle(props.timestep, props.channel))
  }
  return (
    <TableCell component="th" scope="row" key={props.timestep}>
      <Button variant="contained"
              disableRipple={true}
              style={{backgroundColor: props.checked? '#ffff00': '#D3D3D3'}}
              onClick={() => toggle()}
              >
      <React.Fragment/>
      </Button>
    </TableCell>
)
}


function mapStateToProps(state, ownProps){
  return {checked: state['sequence'][ownProps.timestep]['ttl'][ownProps.channel]
        }
}
export default connect(mapStateToProps)(TTLButton)
