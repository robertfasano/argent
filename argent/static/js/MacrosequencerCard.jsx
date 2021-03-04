import React from 'react';
import {connect} from 'react-redux'
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import Box from '@material-ui/core/Box';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import Grid from '@material-ui/core/Grid';
import Card from '@material-ui/core/Card';
import Paper from '@material-ui/core/Paper';

import CardContent from '@material-ui/core/CardContent';
import CardHeader from '@material-ui/core/CardHeader';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ExpandLessIcon from '@material-ui/icons/ExpandLess';
import Button from '@material-ui/core/Button';
import CloseIcon from '@material-ui/icons/Close';

function MacrosequencerCard(props) {
  // const [value, setValue] = React.useState(props.name)
  const value = props.macrosequence[props.index].name
  const [expanded, setExpanded] = React.useState(false)
  // const [reps, setReps] = React.useState(1)
  const reps = props.macrosequence[props.index].reps

  function remove() {
    props.dispatch({type: 'macrosequence/remove', index: props.index})
  }

  function setValue(name) {
    props.dispatch({type: 'macrosequence/updateSequence', index: props.index, name: name})
  }

  function setReps(reps) {
    props.dispatch({type: 'macrosequence/updateReps', index: props.index, reps: reps})
  }

  return (
      <Paper elevation={6}>
      <Box p={2} pr={0} mr={-1}>
      <Grid container spacing={2}>
        <Grid container item xs={11} justify="space-between">
          <Select value={value}
                  width='100%'
                  onChange={(event) => setValue(event.target.value)}
                  >
            {Object.keys(props.sequences).map((name, index) => {
                return (
                  <MenuItem key={name} value={name}>{name}</MenuItem>
                  )
                }
              )
            }
          </Select>
        </Grid>

        <Grid container item xs={1} justify="flex-end">
          {props.macrosequence.length > 1?
          <Button onClick={remove}>
                <CloseIcon/>
          </Button>
          : null
        }
      </Grid>
      <Grid item xs={12}>
        <TextField label="Repetitions" value={reps} onChange={(event)=>setReps(event.target.value)}/>
      </Grid>
    </Grid>
    </Box>
    </Paper>
  )
}

function mapStateToProps(state, ownProps){
  return {sequences: state['sequences'],
          activeSequence: state['active_sequence'],
          name: state['macrosequence'][ownProps.index].name,
          macrosequence: state['macrosequence']
        }
}
export default connect(mapStateToProps)(MacrosequencerCard)
