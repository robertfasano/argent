import React from 'react'
import PropTypes from 'prop-types'
import { makeStyles } from '@material-ui/core/styles'
import AppBar from '@material-ui/core/AppBar'
import Tabs from '@material-ui/core/Tabs'
import Tab from '@material-ui/core/Tab'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import Box from '@material-ui/core/Box'
import Button from '@material-ui/core/Button'
import AddIcon from '@material-ui/icons/Add'
import LoadButton from './LoadButton.jsx'
import { connect, shallowEqual } from 'react-redux'
import defaultSequence from '../schema.js'
import { createSelector } from 'reselect'

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    backgroundColor: theme.palette.background.paper,
    width: '100%'
  }
}))

function SequenceSelector (props) {
  // A set of tabs allowing a sequence to be chosen.
  // The active sequence is the one which is displayed in the table area and
  // sent to the code generator.
  const classes = useStyles()
  const value = props.sequenceNames.indexOf(props.activeSequence)
  const handleChange = (event, newValue) => {
    const name = props.sequenceNames[newValue]
    props.setActive(name)
  }

  function newSequence () {
    let name = 'new sequence'
    let i = 0
    while (props.sequenceNames.includes(name)) {
      i = i + 1
      name = `new sequence (${i})`
    }
    props.load(name, { steps: defaultSequence(props.channels), variables: {}, parameters: {}, script: { analysis: null, preparation: null }, ui: { groups: { variables: {}, parameters: {} } } })
  }

  const AddTab = () => {
    return (
    <Box p={1}>
      <List style={{
        display: 'flex',
        flexDirection: 'row',
        padding: 0
      }}>
        <ListItem>
          <Button onClick={newSequence}>
            <AddIcon/>
          </Button>
        </ListItem>
        <ListItem>
          <LoadButton/>
        </ListItem>
      </List>
    </Box>
    )
  }

  return (
    <div className={classes.root}>
      <AppBar position="static" color="default">
        <Tabs value={value} onChange={handleChange}>
          {props.sequenceNames.map((name, index) => (
            <Tab key={name} label={name} value={index} style={{ textTransform: 'none' }}/>
          ))}

          <AddTab/>
        </Tabs>
      </AppBar>
    </div>
  )
}

SequenceSelector.propTypes = {
  sequenceNames: PropTypes.array,
  activeSequence: PropTypes.string,
  channels: PropTypes.object,
  load: PropTypes.func,
  setActive: PropTypes.func
}

function mapDispatchToProps (dispatch, props) {
  return {
    load: (name, sequence) => dispatch({ type: 'sequence/load', name: name, sequence: sequence }),
    setActive: (name) => dispatch({ type: 'sequence/setActive', name: name })
  }
}

const selectSequenceNames = createSelector(state => state.sequences,
  sequences => Object.keys(sequences),
  { memoizeOptions: { resultEqualityCheck: shallowEqual } }
)

function mapStateToProps (state, ownProps) {
  return {
    sequenceNames: selectSequenceNames(state),
    activeSequence: state.active_sequence,
    channels: state.channels
  }
}
export default connect(mapStateToProps, mapDispatchToProps)(SequenceSelector)
