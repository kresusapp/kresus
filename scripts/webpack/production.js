const webpack = require('webpack');
const config = require('./base.js');

const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');

config.mode = "production";

// Report first error as hard error.
config.bail = true;

// Do not capture timing information for each module.
config.profile = false;

config.plugins = config.plugins.concat([
    // Minimize CSS.
    new OptimizeCssAssetsPlugin({
        cssProcessor: require('cssnano'),
        cssProcessorOptions: {
            zindex: false
        }
    })
]);

module.exports = config;
