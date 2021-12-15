import React from 'react'
import Popover from '@material-ui/core/Popover'
import Box from '@material-ui/core/Box'
import Typography from '@material-ui/core/Typography'
import ScriptSelector from './ScriptSelector.jsx'

export default function ScriptPopover (props) {
  return (
      <Popover
        open={Boolean(props.anchor)}
        anchorEl={props.anchor}
        onClose={(event) => props.setAnchor(null)}
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
              Scripts
          </Typography>
          <ScriptSelector variant="preparation"/>
          <ScriptSelector variant="analysis"/>
        </Box>
      </Popover>
  )
}
