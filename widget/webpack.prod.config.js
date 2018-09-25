const config = require('./webpack.config.js');
const webpack = require('webpack');
const path = require('path');

config.plugins.push(
  new webpack.DefinePlugin({
      'process.env.NODE_ENV' : JSON.stringify('production'),
      'process.env.DEBUG': JSON.stringify('false'),
      'process.env.ASSETS_URL': JSON.stringify('http://widget.apik.co.id'),
      'process.env.SOCKET_URL': JSON.stringify('http://widget.apik.co.id'),
  }),
);

config.plugins.push(
  new webpack.optimize.UglifyJsPlugin({
    compress: {
      warnings: false
    }
  })
);

config.output = {
  path: path.join(__dirname, '/static'),
  publicPath: '/',
  filename: 'bundle.js'
}

module.exports = config;
