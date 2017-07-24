const webpack = require("webpack");
const config = require("./webpack.config.base.js");


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
    })
]);

module.exports = config;
