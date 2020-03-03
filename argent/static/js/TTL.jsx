import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography'
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import {connect} from 'react-redux'
import * as actions from './reducers/actions.js'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ExpandLessIcon from '@material-ui/icons/ExpandLess';

function Fill(props) {
  let fill = [...Array(props.length).keys()]
  return (
    <React.Fragment>
      {fill.map(i =>
        <TableCell key={i} style={{borderBottom: "none"}} />
      )}
    </React.Fragment>
  )
}
function TTLTable(props) {
  const [expanded, setExpanded] = React.useState(true)

  return (
    <div>
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell style={{borderBottom: "none"}}/>
              {props.timing.map((t, index) => (
                <TableCell key={index} style={{borderBottom: "none"}}>
                  {t}
                </TableCell>
              ))}
              <Fill length={32-props.timing.length} />
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell style={{borderBottom: "none"}}> <IconButton onClick={()=>setExpanded(!expanded)} > {expanded? <ExpandLessIcon/>: <ExpandMoreIcon /> }</IconButton> </TableCell>
              <TableCell style={{borderBottom: "none"}}><Typography> TTL </Typography></TableCell>
              <Fill length={31-props.timing.length} />
            </TableRow>
            {expanded? (
              <React.Fragment>
              {props.channels.TTL.map(i => (
                <TableRow key={i}>
                  <TableCell style={{borderBottom: "none"}}> TTL{i} </TableCell>
                  {props.timing.map((t, index) => (
                    <TableCell component="th" scope="row" key={index} style={{width: '2rem', height: '2rem', borderBottom: "none"}}>
                      <Button variant="contained"
                              disableRipple={true}
                              style={{width: '2rem', height: '2rem', backgroundColor: props.state[index].includes(i)? '#ffff00': '#D3D3D3'}}
                              onClick={() => props.dispatch(actions.ttl.toggle(index, i))}
                              >
                      <React.Fragment/>
                      </Button>
                    </TableCell>
                  ))}
                  <Fill length={32-props.timing.length} />

                </TableRow>
              ))}
              </React.Fragment>
          ): null
        }

          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
}


function mapStateToProps(state, ownProps){
  return {state: state['ttl'],
          timing: state['timing'],
          channels: state['channels']
        }
}
export default connect(mapStateToProps)(TTLTable)
