import React from 'react';
import {connect} from 'react-redux'
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Drawer from '@material-ui/core/Drawer';
import Typography from '@material-ui/core/Typography';

import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';

function Macrosequencer(props) {
  const items = Object.keys(props.sequences)
  return (
    <Drawer elevation={24} variant="persistent" anchor="right" open={true}
            className={props.classes.drawer}
            classes={{paper: props.classes.drawerPaper}}>
      <Typography variant='h6' align='center'> Macrosequencer </Typography>
      <Typography variant='subtitle1'>Library </Typography>
      <List component="nav">
      {items.map(item => (
          <ListItem button>
            <ListItemText primary={item} />
          </ListItem>
      )

      )}
      </List>

    </Drawer>
  )
}

function mapStateToProps(state, ownProps){
  return {sequences: state['sequences'],
          active_sequence: state['active_sequence'],
          sequence: state['sequence']
        }
}
export default connect(mapStateToProps)(Macrosequencer)
