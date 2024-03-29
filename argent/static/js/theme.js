import { createTheme } from '@material-ui/core/styles'

const cellWidth = '85px'
const cellHeight = '30px'

const theme = createTheme({
  typography: {
    fontFamily: ['Roboto', 'Arial']
  },
  palette: {
    secondary: { main: '#67001a' },
    primary: { main: '#004e67' }
  },
  overrides: {
    MuiTab: {
      root: {
        '&$selected': {
          backgroundColor: '#67001a',
          color: 'white'
        }
      }
    },
    MuiTableCell: {
      root: { // This can be referred from Material UI API documentation.
        borderBottom: false,
        padding: '2px 1px 2px 1px'
      }
    },
    MuiButton: {
      root: {
        padding: 'none',
        width: cellWidth,
        height: cellHeight
      }
    }
  }
})

export default theme
