import React from 'react'
import Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'
import { connect } from 'react-redux'
import TableCell from '@material-ui/core/TableCell'
import PropTypes from 'prop-types'
import { countBy } from 'lodash'

function Timeline (props) {
  // through props, receives an array of RTIO states for all timesteps
  const starts = []
  const stops = []
  const nodes = []
  const xi = []
  const yi = []
  const implicitIndices = []

  // calculate start points of each step (which may be NaN for undefined steps)
  for (const data of props.data) {
    if (data.mode === 'setpoint') {
      starts.push(parseLinkedParameter(data.setpoint, props.variables))
      stops.push(parseLinkedParameter(data.setpoint, props.variables))
    } else if (data.mode === 'ramp') {
      starts.push(parseLinkedParameter(data.ramp.start, props.variables))
      stops.push(parseLinkedParameter(data.ramp.stop, props.variables))
    }
  }

  // if all values are NaN, replace all with zero; otherwise, we do a cyclical fill to replace values with the last valid setpoint
  for (let i = 0; i < starts.length; i++) {
    if (isNaN(starts[i]) || isNaN(stops[i])) implicitIndices.push(i)
  }
  if (countBy(starts)[NaN] === starts.length) starts.fill(0)
  if (countBy(stops)[NaN] === stops.length) stops.fill(0)

  // cyclically fill start and stop values by propagating last valid setpoint
  let rotations = 0
  while ([...starts, ...stops].includes(NaN) || [...starts, ...stops].includes(undefined)) {
    forwardFill(starts, stops, 0)
    forwardFill(stops, starts, 1)
    arrayRotate(starts)
    arrayRotate(stops)
    rotations += 1
  }
  for (let i = 0; i < rotations; i++) {
    arrayRotate(starts, true)
    arrayRotate(stops, true)
  }

  // determine coordinates of midpoints (node locations)
  for (let i = 0; i < starts.length; i++) {
    nodes.push([i + 0.5, (starts[i] + stops[i]) / 2])
  }

  // generate interpolated coordinates for drawing the full timeline
  for (let i = 0; i < starts.length; i++) {
    xi.push(...linspace(i, i + 1, 100))
    if (starts[i] === stops[i]) yi.push(...Array(100).fill(starts[i]))
    else yi.push(...linspace(starts[i], stops[i], 100))
  }

  let min = Math.min(...slice(nodes, 1), ...starts, ...stops)
  let max = Math.max(...slice(nodes, 1), ...starts, ...stops)
  if (min === 0 && max === 0) {
    min = -1
    max = 1
  }
  const interpolated = stack(xi, yi)

  const points = []
  for (const index in nodes) {
    points.push({ x: nodes[index][0], y: nodes[index][1] })
    if (implicitIndices.includes(parseInt(index))) {
      points[index].color = '#585858'
      points[index].marker = { enabled: false, radius: 3, symbol: 'circle' }
      points[index].dataLabels = { enabled: false }
    } else {
      points[index].color = '#67001a'
      points[index].marker = { enabled: true, radius: 3, symbol: 'circle' }
      points[index].dataLabels = { enabled: true, format: '{y} ' + props.unit }
    }
  }
  const margin = 0.01

  const state = {
    options: {
      tooltip: { enabled: false },
      credits: { enabled: false },
      chart: { height: 50, margin: 0, width: null, padding: 0 },
      yAxis: {
        min: min - margin,
        max: max + margin,
        visible: false
      },
      xAxis: { visible: false, min: 0, max: starts.length },
      title: { text: '' },
      series: [
        {
          marker: { enabled: false, radius: 3, symbol: 'circle' },
          color: '#67001a',
          lineWidth: 1.5,
          showInLegend: false,
          data: interpolated,
          enableMouseTracking: false,
          step: 'left',
          states: {
            hover: {
              enabled: false
            },
            inactive: {
              opacity: 1
            }
          }
        },
        {
          type: 'scatter',
          cursor: 'pointer',
          point: {
            events: {
              click: function (event) {
                props.onClick(parseInt(this.category - 0.5), event)
              }
            }
          },
          step: 'center',
          lineWidth: 0,
          showInLegend: false,
          data: points,
          states: {
            inactive: {
              opacity: 1
            }
          }
        }

      ]
    }
  }
  return (
    <TableCell colSpan={nodes.length} style={{ padding: '0px 0px 0px 0px' }}>
      <HighchartsReact
          constructorType={'chart'}
          highcharts={Highcharts}
          options={state.options}
        />
    </TableCell>
  )
}

Timeline.propTypes = {
  data: PropTypes.array,
  variables: PropTypes.object,
  unit: PropTypes.string,
  onClick: PropTypes.func
}

function arange (start, stop, step) {
  const arr = []
  if (start < stop) {
    for (let i = start; i < stop; i += step) {
      arr.push(i)
    }
  } else {
    for (let i = start; i > stop; i += step) {
      arr.push(i)
    }
  }
  return arr
}

function linspace (start, stop, points) {
  return arange(start, stop, (stop - start) / points)
}

function stack (arr1, arr2) {
  const arr = []
  for (let i = 0; i < arr1.length; i++) {
    arr.push([arr1[i], arr2[i]])
  }
  return arr
}

function forwardFill (arr, other, shift) {
  shift = shift || 0
  for (const i in arr) {
    if (isNaN(arr[i]) || arr[i] === undefined) {
      arr[i] = other[i - 1 + shift]
    }
  }
  return arr
}

function arrayRotate (arr, reverse) {
  if (reverse) arr.unshift(arr.pop())
  else arr.push(arr.shift())
  return arr
}

function parseLinkedParameter (setpoint, variables) {
  if (setpoint.includes('self.')) return parseFloat(variables[setpoint.split('self.')[1]])
  else return parseFloat(setpoint)
}

function slice (array, axis) {
  const slice = []
  for (let i = 0; i < array.length; i++) {
    slice.push(array[i][axis])
  }
  return slice
}

function mapStateToProps (state, props) {
  return {
    variables: state.variables,
    unit: props.unit || ''
  }
}

export default connect(mapStateToProps)(Timeline)
