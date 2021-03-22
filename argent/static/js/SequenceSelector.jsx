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
import TabMenu from './TabMenu.jsx'
import LoadButton from './menu/LoadButton.jsx'
import { connect } from 'react-redux'
import { defaultSequence } from '../index.jsx'

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    backgroundColor: theme.palette.background.paper,
    width: '100%'
  }
}))

function SequenceSelector (props) {
  // A set of tabs allowing a sequence (or the master sequence) to be chosen.
  // The active sequence is the one which is displayed in the table area and
  // sent to the code generator.
  const classes = useStyles()
  const [anchorEl, setAnchorEl] = React.useState(null)
  const [anchorName, setAnchorName] = React.useState('')

  const value = props.tableChoice === 'master' ? -1 : Object.keys(props.sequences).indexOf(props.activeSequence)

  const handleChange = (event, newValue) => {
    if (newValue === -1) {
      props.setTableChoice('master')
    } else {
      const name = Object.keys(props.sequences)[newValue]
      props.dispatch({ type: 'sequence/setActive', name: name })
      props.setTableChoice('rtio')
    }
  }

  function newSequence () {
    let name = 'new sequence'
    let i = 0
    while (Object.keys(props.sequences).includes(name)) {
      i = i + 1
      name = `new sequence (${i})`
    }
    props.dispatch({ type: 'sequence/load', name: name, sequence: {steps: defaultSequence(props.channels), inputs: {}, outputs: {}, arguments: {}} })
  }

  function handleClick (event, name) {
    event.preventDefault()
    setAnchorEl(event.currentTarget)
    setAnchorName(name)
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
				<Tab label='master' value={-1} style={{ textTransform: 'none', backgroundColor: '#67001a', color: 'white' }}/>
				{Object.keys(props.sequences).map((name, index) => (
					<Tab key={name} onContextMenu={(event) => handleClick(event, name)} label={name} value={index} style={{ textTransform: 'none' }}/>
				))}

				<AddTab/>
			</Tabs>
			{Object.keys(props.sequences).map((name, index) => (
				<TabMenu key={name} anchorEl={anchorEl} setAnchorEl={setAnchorEl} name={name} anchorName={anchorName}/>
			))}
		</AppBar>
	</div>
  )
}

SequenceSelector.propTypes = {
  sequences: PropTypes.object,
  activeSequence: PropTypes.string,
  channels: PropTypes.object,
  dispatch: PropTypes.func,
  tableChoice: PropTypes.string,
  setTableChoice: PropTypes.func
}

function mapStateToProps (state, ownProps) {
  return {
    sequences: state.sequences,
    activeSequence: state.active_sequence,
    channels: state.channels
  }
}
export default connect(mapStateToProps)(SequenceSelector)
