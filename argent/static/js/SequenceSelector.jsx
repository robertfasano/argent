import React from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import {connect} from 'react-redux'

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    backgroundColor: theme.palette.background.paper,
    width: '100%'
  },
}));

function SequenceSelector(props) {
  const classes = useStyles();
  // const [value, setValue] = React.useState(0);

  var value = props.tableChoice == 'master'? -1: Object.keys(props.sequences).indexOf(props.activeSequence)

  const handleChange = (event, newValue) => {
    if (newValue == -1) {
      props.setTableChoice('master')
    }
    else {
      let name = Object.keys(props.sequences)[newValue]
      props.dispatch({type: 'sequence/retrieve', name: name})
      props.setTableChoice('rtio')
    }


    // setValue(newValue);
  };

  return (
    <div className={classes.root}>
      <AppBar position="static" color="default">
        <Tabs value={value} onChange={handleChange}>
            <Tab label='master' value={-1} style={{'textTransform': 'none', 'backgroundColor': '#67001a', 'color': 'white'}}/>
            {Object.keys(props.sequences).map((i, index) => (
              <Tab label={i} value={index} style={{'textTransform': 'none'}}/>
            ))}
        </Tabs>
      </AppBar>
    </div>
  );
}

function mapStateToProps(state, ownProps){
  return {sequences: state['sequences'],
          activeSequence: state['active_sequence']
        }
}
export default connect(mapStateToProps)(SequenceSelector)
