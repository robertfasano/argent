const path = require('path')
const mode = 'development'
const distPath = path.join(__dirname, '/dist')
const entryPath = path.join(__dirname, '/index.jsx')
const config = {
  devtool: mode === 'production' ? false : 'source-map',
  entry: entryPath,
  output: {
    path: distPath,
    filename: 'bundle.js',
    library: 'index',
    libraryTarget: 'var'
  },
  resolve: {
    extensions: ['.js', '.jsx', '.css']
  },
  module: {
    rules: [
      {
        test: /\.jsx?/,
        exclude: /node_modules/,
        use: 'babel-loader'
      }
    ]
  }
}
module.exports = config
