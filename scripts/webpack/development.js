var webpack = require('webpack');
const config = require('./base.js');

config.mode = "development";

config.devtool = 'cheap-module-eval-source-map';

module.exports = config;
