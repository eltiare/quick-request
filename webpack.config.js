let path = require('path');
let webpack = require('webpack');
let BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
let nodeExternals = require('webpack-node-externals');

let env = process.env.NODE_ENV || 'dev';
let prod = env === 'production';

let plugins = [
  new BundleAnalyzerPlugin({
    analyzerMode: 'server',
    analyzerHost: '127.0.0.1',
    analyzerPort: 8889
  })
];

let config = {
  devtool: prod ? false : 'source-map',
  entry: {
    "index.js":           "./src/quick-request.js"
  },
  output: {
    path: path.resolve(__dirname),
    filename: '[name]',
    library: 'simpleRequest',
    libraryTarget: 'umd'
  },
  externals: prod ? [ nodeExternals() ] : [],
  plugins: plugins,
  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        loader: 'babel-loader',
        query: {
          presets: [
            [ 'es2015', { modules: false } ],
            [ "env", {
              "targets" : {
                "browsers" : ["last 3 versions", "ie >= 9"]
              }
            }],
            'stage-0'
          ],
          plugins: [
            "add-module-exports",
            "transform-export-extensions"
          ]
        },

        exclude: path.resolve(__dirname, 'node_modules')
      }
    ]
  }
};

module.exports = config;
