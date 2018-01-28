var webpack = require('webpack');
const config = require('./base.js');

config.plugins.push(
    // Set process.env.NODE_ENV to development, if it's not set, and
    // replaces instances in the code.
    new webpack.EnvironmentPlugin({ 'NODE_ENV': 'development' })
);

config.devtool = 'cheap-module-eval-source-map';

module.exports = config;
