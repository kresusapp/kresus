const webpack = require('webpack');
const config = require('./base.js');

const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');

// Report first error as hard error
config.bail = true;
// Do not capture timing information for each module
config.profile = false;

config.plugins = config.plugins.concat([
    new webpack.NoEmitOnErrorsPlugin(),  // Any error is considered a failure
    new webpack.DefinePlugin({  // Set production environment variable
        'process.env': {
            'NODE_ENV': "'production'"
        }
    }),
    // Minimize CSS
    // We are doing it in a dedicated step as we merge all CSS files together
    // so this might end up with code duplication, which will be solved with
    // this processing step.
    new OptimizeCssAssetsPlugin({
        cssProcessor: require('cssnano')
    })
]);

module.exports = config;
