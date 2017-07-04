const path = require('path');
const webpack = require('webpack');

//const UglifyPlugin = require('uglify-es-webpack-plugin');

const config = module.exports = {
    entry: './client/main.js',
    output: {
        filename: 'main.js',
        path: path.resolve(__dirname, 'build', 'client', 'js')
    },
    module: {
        loaders: [
            {
                test: /\.js$/,
                loader: 'babel-loader',
                //exclude: /node_modules/,
                query: {
                    presets: [
                        ['es2015', { modules: false }],
                        'react',
                        'stage-0'
                    ]
                }
            }
        ]
    },
    plugins: [
        //new webpack.optimize.ModuleConcatenationPlugin()
    ]
};

//if (process.env.NODE_ENV === 'production') {
    //config.devtool = 'source-map';

    //config.plugins = config.plugins.concat([
        //new UglifyPlugin()
    //]);
//}
