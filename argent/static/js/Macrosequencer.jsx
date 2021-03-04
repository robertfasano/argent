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
import TextField from '@material-ui/core/TextField';
import Box from '@material-ui/core/Box';

import Grid from '@material-ui/core/Grid';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Button from '@material-ui/core/Button';
import AddIcon from '@material-ui/icons/Add';
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import MacrosequencerCard from './MacrosequencerCard.jsx'

function Macrosequencer(props) {
  // const [macrosequence, setMacrosequence] = React.useState('')

  // function submit() {
  //   let obj = []
  //   for (let name of macrosequence.split(',')) {
  //     obj.push({name: name.trim(), sequence: props.sequences[name]})
  //   }
  //   console.log(obj)
  // }

  function add() {
    props.dispatch({type: 'macrosequence/add', sequence: props.macrosequence[props.macrosequence.length-1]})
  }

  return (
      <Box mx={2}>
      <Grid container spacing={1}>
          {props.macrosequence.map((item, index) => {
              return (
                <Grid item xs={12}>
                  <MacrosequencerCard index={index}/>
                </Grid>

                )
              }
            )
          }
        <Grid container item xs={12} justify='center'>
          <Button onClick={add}>
            <AddIcon/>
          </Button>
        </Grid>
      </Grid>
      </Box>
  )
}

function mapStateToProps(state, ownProps){
  return {sequences: state['sequences'],
          active_sequence: state['active_sequence'],
          sequence: state['sequence'],
          macrosequence: state['macrosequence']
        }
}
export default connect(mapStateToProps)(Macrosequencer)
