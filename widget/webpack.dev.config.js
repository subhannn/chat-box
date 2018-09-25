const config = require('./webpack.config.js');
const webpack = require('webpack');

config.plugins.push(
    new webpack.DefinePlugin({
        'process.env.NODE_ENV' : JSON.stringify('development'),
        'process.env.DEBUG': JSON.stringify('true'),
        'process.env.ASSETS_URL': JSON.stringify('http://localhost:8081/'),
        'process.env.SOCKET_URL': JSON.stringify('http://localhost:9000/'),
    }),
);

module.exports = config;