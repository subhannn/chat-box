const webpack = require('webpack');
const path = require('path');

module.exports = env = {
  entry: [
    './src/index'
  ],
  module: {
    loaders: [
      { test: /\.js(x|)/, loader: 'babel-loader', exclude: /node_modules/ },
      // { test: /\.s?css$/, loader: 'style-loader!css-loader!sass-loader' },
      {
        include: path.join(__dirname, 'src/assets/stylesheets'),
        loaders: [
          {loader: 'style-loader', options: { 
            attrs: { 
              class: '_chatboxLoaderCss'
            }
          } },
          'css-loader?importLoader=1&modules&localIdentName=[path]___[name]__[local]___[hash:base64:5]'
        ],
        test: /\.css$/
      },
    ]
  },
  resolve: {
    // alias: {
    //   ws: path.resolve ('./') + '/src/shim/ws.js'
    // },
    extensions: ['.js','.scss', '.jsx']
  },
  output: {
    path: path.join(__dirname, '/dist'),
    publicPath: '/',
    filename: 'bundle.js'
  },
  devtool: 'cheap-eval-source-map',
  devServer: {
    contentBase: './dist',
    hot: true
  },
  plugins: [
    new webpack.optimize.OccurrenceOrderPlugin(),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoEmitOnErrorsPlugin(),
  ]
};
