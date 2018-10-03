const config = require('./webpack.config.js');
const webpack = require('webpack');
const path = require('path');
const merge = require('webpack-merge');
const CleanWebpackPlugin = require('clean-webpack-plugin');

module.exports = merge(config, {
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'static')
    },
    devServer: {
      contentBase: './static',
      hot: true
    },
    plugins: [
      new webpack.DefinePlugin({
          'process.env.NODE_ENV' : JSON.stringify('production'),
          'process.env.DEBUG': JSON.stringify('false'),
          'process.env.ASSETS_URL': JSON.stringify('https://widget.apik.co.id/'),
          'process.env.SOCKET_URL': JSON.stringify('https://widget.apik.co.id/'),
      }),
      new CleanWebpackPlugin(['static']),
      new webpack.LoaderOptionsPlugin({
        options: {
          mode: 'production'
        }
      }),
      new webpack.optimize.UglifyJsPlugin({
        sourceMap: true,
        compress: {
          warnings: false
        },
        output: {
          comments: false,
        }
      })
    ]
});

// config.plugins.push(
//   new webpack.DefinePlugin({
//       'process.env.NODE_ENV' : JSON.stringify('production'),
//       'process.env.DEBUG': JSON.stringify('false'),
//       'process.env.ASSETS_URL': JSON.stringify('http://widget.apik.co.id'),
//       'process.env.SOCKET_URL': JSON.stringify('http://widget.apik.co.id'),
//   })
// );

// config.plugins.push(
//   new webpack.optimize.UglifyJsPlugin({
//     sourceMap: true,
//     compress: {
//       warnings: false
//     },
//     output: {
//       comments: false,
//     }
//   })
// );

// config.output = {
//   path: path.join(__dirname, '/static'),
//   publicPath: '/',
//   filename: 'bundle.js'
// }

// module.exports = config;
