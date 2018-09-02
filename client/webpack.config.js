let path = require('path');
let webpack = require('webpack');

module.exports = {
    devtool: 'source-map',
    entry: {
        widget: [
            path.join(__dirname, 'src', 'widget', 'widget-index.js')
        ],
        api: [
            path.join(__dirname, 'src', 'api', 'index.js')
        ],
        // chat: [
        //     path.join(__dirname, 'src', 'chat', 'chat-index.js')
        // ],
    },
    output: {
        path: path.join(__dirname, 'dist', 'js'),
        filename: '[name].js',
        publicPath: '/js/'
    },
    module: {
        loaders: [
            {
                include: path.join(__dirname, 'src/widget'),
                loaders: [
                  'style-loader',
                  'css-loader?importLoader=1&modules&localIdentName=[path]___[name]__[local]___[hash:base64:5]'
                ],
                test: /\.css$/
            },
            { test: /\.js$/, loaders: ['babel-loader'], include: path.join(__dirname, 'src'), exclude: /node_modules/ },
            // { test: /\.css$/, loader: 'style!css!sass', include: path.join(__dirname, 'css') },
        ]
    },
    plugins: [
        new webpack.DefinePlugin({
            'process.env': {
                'NODE_ENV': JSON.stringify('production')
            }
        }),
        new webpack.optimize.UglifyJsPlugin({
            compressor: {
                warnings: false
            }
        })
    ]
};