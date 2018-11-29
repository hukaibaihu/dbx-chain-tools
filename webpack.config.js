module.exports = {
  output: {
    library: 'DBXChainTools',
    libraryTarget: 'umd'
  },
  module: {
    rules: [{
      test: /\.js$/,
      exclude: /node_modules/,
      loader: 'babel-loader'
    }]
  },
  externals: {
    'bitsharesjs': 'bitsharesjs',
    'safe-buffer': 'safe-buffer'
  }
}
