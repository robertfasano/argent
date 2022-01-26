import React from 'react'
import PropTypes from 'prop-types'
import LinkableParameter from '../components/LinkableParameter'
import AddIcon from '@material-ui/icons/Add'
import Button from '@material-ui/core/Button'
import Box from '@material-ui/core/Box'
import TextField from '@material-ui/core/TextField'
import FixedUnitInput from '../components/FixedUnitInput'

function Spline (props) {

  const updateSpline = ( index, value ) => {
    const arr = [...props.spline.points]
    arr[index] = value
    props.update(props.prefix + '/spline/points', arr)
  }

  return (
    <>
    <Box mx={1}>
      <FixedUnitInput value={props.spline.steps}
                        onChange = {(value) => props.update(props.prefix + '/spline/steps', value)}
                        unit = {''}
                        label={'Steps!'}
                        style={{ width: '250px' }}
      />

      {/* <TextField label='Steps'
                value={props.spline.steps}
                onChange={(event) => props.update(props.prefix + '/spline/steps', event.target.value)}
                InputLabelProps={{ shrink: true }}
      /> */}
    </Box>
    {props.spline.points.map((value, i) => <LinkableParameter key={i} value={value} onChange={(value) => updateSpline(i, value)} label={String(i)} unit={props.unit}/>)}
    {/* <Button onClick={() => updateSpline(props.points.length, '')} style={{ textTransform: 'none' }}>
      <AddIcon/>
    </Button> */}
    </>
    )
}

Spline.propTypes = {
  spline: PropTypes.object,
  update: PropTypes.func,
  prefix: PropTypes.string,
  unit: PropTypes.string
}

export default Spline
