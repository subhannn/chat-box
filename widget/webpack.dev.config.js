const config = require('./webpack.config.js');
const webpack = require('webpack');
const path = require('path');
const merge = require('webpack-merge');

module.exports = merge(config, {
    devtool: 'cheap-eval-source-map',
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist')
    },
    devServer: {
        contentBase: './dist',
        hot: true
    },
    plugins: [
      new webpack.DefinePlugin({
        'process.env.NODE_ENV' : JSON.stringify('development'),
        'process.env.DEBUG': JSON.stringify('true'),
        'process.env.ASSETS_URL': JSON.stringify('http://localhost:8081/'),
        'process.env.SOCKET_URL': JSON.stringify('http://localhost:9000/'),
      }),
    //   new webpack.LoaderOptionsPlugin({
    //     options: {
    //       mode: 'development'
    //     }
    //   }),
    //   new webpack.optimize.UglifyJsPlugin({
    //     sourceMap: true,
    //     compress: {
    //       warnings: false
    //     },
    //     output: {
    //       comments: false,
    //     }
    //   })
    ]
});

// devtool: 'cheap-eval-source-map',
//   devServer: {
//     contentBase: './static',
//     hot: true
//   },
// config.plugins.push(
//     new webpack.DefinePlugin({
//         'process.env.NODE_ENV' : JSON.stringify('development'),
//         'process.env.DEBUG': JSON.stringify('true'),
//         'process.env.ASSETS_URL': JSON.stringify('http://localhost:8081/'),
//         'process.env.SOCKET_URL': JSON.stringify('http://localhost:9000/'),
//     }),
//     new webpack.optimize.UglifyJsPlugin({
//         compress: {
//           warnings: false
//         }
//     })
// );

// config.output = {
//     path: path.join(__dirname, '/dist'),
//     publicPath: '/',
//     filename: 'bundle.js'
// }

// module.exports = config;