import React from 'react'
import PropTypes from 'prop-types'
import Button from '@material-ui/core/Button'
import Popover from '@material-ui/core/Popover'
import TableCell from '@material-ui/core/TableCell'
import Box from '@material-ui/core/Box'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
import FixedUnitInput from '../../components/FixedUnitInput.jsx'
import IntegerUnitInput from '../../components/IntegerUnitInput.jsx'
import { connect } from 'react-redux'
import Select from '@material-ui/core/Select'
import MenuItem from '@material-ui/core/MenuItem'
import FormControl from '@material-ui/core/FormControl'
import InputLabel from '@material-ui/core/InputLabel'
import { selectTimestep } from '../../selectors.js'

function CameraButton (props) {
  const [anchorEl, setAnchorEl] = React.useState(null)
  const open = Boolean(anchorEl)

  const color = props.enable ? '#67001a' : '#D3D3D3'

  const style = {
    background: `linear-gradient(90deg, ${color} 0%, ${color} 100%)`,
    color: 'white',
    fontSize: 10,
    textTransform: 'none'
  }

  const handleContextMenu = (event) => {
    event.preventDefault()
    setAnchorEl(event.currentTarget)
  }

  return (
    <TableCell component="th" scope="row">
      <Button variant="contained"
              disableRipple={true}
              style={style}
              onContextMenu={handleContextMenu}
              onClick={props.toggle}
              >
      </Button>
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={(event) => setAnchorEl(null)}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right'
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left'
        }}
      >
        <Box p={1}>
          <Typography style={{ fontWeight: 'bold', fontSize: 24 }}>
              Camera options
          </Typography>
          <Box m={1}>
            <FixedUnitInput value={props.duration}
                        onChange={props.setDuration}
                        unit = 'ms'
                        label = 'Exposure'
                        style={{ width: '100px' }}
                />
          </Box>
          <Box m={1}>
          <Grid container>
              <Grid item xs={6}>
              <IntegerUnitInput value={props.ROI[0][0]}
                        onChange={props.setROIx1}
                        unit = 'px'
                        label = 'X1'
                        style={{ width: '63px' }}
              />
              </Grid>
              <Grid item xs={6}>
              <IntegerUnitInput value={props.ROI[0][1]}
                        onChange={props.setROIx2}
                        unit = 'px'
                        label = 'X2'
                        style={{ width: '63px' }}
              />
              </Grid>
          </Grid>
          </Box>
          <Box m={1}>
          <Grid container>
              <Grid item xs={6}>
              <IntegerUnitInput value={props.ROI[1][0]}
                        onChange={props.setROIy1}
                        unit = 'px'
                        label = 'Y1'
                        style={{ width: '63px' }}
              />
              </Grid>
              <Grid item xs={6}>
              <IntegerUnitInput value={props.ROI[1][1]}
                        onChange={props.setROIy2}
                        unit = 'px'
                        label = 'Y2'
                        style={{ width: '63px' }}
              />
              </Grid>
          </Grid>
          </Box>

          <FormControl style={{ fullWidth: true, wrap: 'nowrap', margin: 0, display: 'flex' }}>
            <InputLabel shrink={true}> Variable </InputLabel>
            <Select label={"Variable"}
                    value={props.parameter.split('self.')[1]}
                    onChange = {(event) => props.setParameter('self.' + event.target.value)}
                    autoWidth={true}
                    >
              {Object.keys(props.allParameters).map((key, index) => (
                <MenuItem value={key} key={key}>
                  {key}
                </MenuItem>
              ))}
            </Select>
            </FormControl>

        </Box>
      </Popover>
    </TableCell>
  )
}

CameraButton.propTypes = {
  enable: PropTypes.bool,
  delay: PropTypes.string,
  toggle: PropTypes.func,
  channel: PropTypes.object,
  changeChannel: PropTypes.func,
  newOutput: PropTypes.func,
  parameters: PropTypes.object,
  allParameters: PropTypes.object,
  removeOutput: PropTypes.func,
  updateOperation: PropTypes.func,
  replaceOutput: PropTypes.func,
  duration: PropTypes.number,
  setDuration: PropTypes.func,
}

function mapDispatchToProps (dispatch, props) {
  const path = {
    board: props.board,
    timestep: props.timestep
  }

  return {

    toggle: () => dispatch({
      type: 'camera/toggle',
      path: path
    }),

    setDuration: (value) => dispatch({
      type: 'camera/duration',
      value: value,
      path: path
    }),

    setROIx1: (value) => dispatch({
      type: 'camera/ROIx1',
      value: value,
      path: path
    }),

    setROIx2: (value) => dispatch({
      type: 'camera/ROIx2',
      value: value,
      path: path
    }),

    setROIy1: (value) => dispatch({
      type: 'camera/ROIy1',
      value: value,
      path: path
    }),

    setROIy2: (value) => dispatch({
      type: 'camera/ROIy2',
      value: value,
      path: path
    }),

    setParameter: (value) => dispatch({
      type: 'camera/parameter',
      value: value,
      path: path
    })
  }
}

function mapStateToProps (state, props) {
  state = state.present
  const channel = selectTimestep(state, props.timestep).cam[props.board]
  return {
    enable: channel.enable,
    channel: channel,
    ROI: channel.ROI,
    parameter: channel.parameter,
    allParameters: state.parameters,
    duration: channel.duration || selectTimestep(state, props.timestep).duration
  }
}
export default connect(mapStateToProps, mapDispatchToProps)(CameraButton)
