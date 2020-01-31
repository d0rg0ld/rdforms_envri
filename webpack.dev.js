const merge = require('webpack-merge');
const common = require('./webpack.common.js');

module.exports = merge(common, {
  mode: 'development',
  devtool: 'source-map',
  node: {
    fs: 'empty',
    process: false,
  },
  devServer: {
    host: '90.147.102.53',
    port: 8080,
    hot: true,
  },
});
