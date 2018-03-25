const webpack = require('webpack');
const config = require('./base.js');

const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');

// Report first error as hard error.
config.bail = true;

// Do not capture timing information for each module.
config.profile = false;

config.plugins = config.plugins.concat([
    // Any error is considered a failure.
    new webpack.NoEmitOnErrorsPlugin(),

    // Set production environment variable.
    new webpack.DefinePlugin({
        'process.env': {
            'NODE_ENV': "'production'"
        }
    }),

    // Minimize CSS.
    new OptimizeCssAssetsPlugin({
        cssProcessor: require('cssnano')
    })
]);

module.exports = config;
