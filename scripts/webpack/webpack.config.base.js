const fs = require('fs');
const path = require('path');
const webpack = require('webpack');

const CopyWebpackPlugin = require('copy-webpack-plugin');
const ExtractTextPlugin = require("extract-text-webpack-plugin");

// List available locales, to fetch only the required locales from Moment.JS
var locales = [];
fs.readdirSync('shared/locales').forEach(file => {
    locales.push(file.replace(/\.[^/.]+$/, ''));
})
locales = new RegExp(locales.join('|'))


module.exports = {
    entry: [
        './node_modules/normalize.css/normalize.css',
        './node_modules/font-awesome/css/font-awesome.css',
        './node_modules/bootstrap-kresus/css/bootstrap.css',
        './node_modules/bootstrap-kresus/css/bootstrap-theme.css',
        './node_modules/dygraphs/dist/dygraph.css',
        './node_modules/c3/c3.css',
        './node_modules/react-datepicker/dist/react-datepicker.css',
        './node_modules/jquery-minicolors/jquery.minicolors.css',
        './client/css/style.css',
        'whatwg-fetch',
        'jquery-minicolors',
        './node_modules/bootstrap-kresus/js/bootstrap.js',
        './client/main.js'
    ],
    output: {
        path: path.resolve(__dirname, '..', '..', 'build', 'client'),
        filename: '[name].js',
    },
    module: {
        loaders: [
            {
                test: /\.js$/,
                exclude: /(node_modules)/,
                use: {
                    loader: 'babel-loader'
                }
            },
            {
                test: /\.css$/,
                use: ExtractTextPlugin.extract({
                    fallback: 'style-loader',
                    use: ['css-loader']
                })
            },
            {
                test: /\.(jpe?g|png|gif|svg)$/i,
                loaders: [
                    'file-loader?hash=sha512&digest=hex&name=[hash].[ext]',
                    {
                        loader: 'image-webpack-loader',
                        query: {
                            bypassOnDebug: true,
                            'optipng': {
                                optimizationLevel: 7
                            },
                            'gifsicle': {
                                interlaced: false
                            }
                        }
                    }
                ]
            },
            {
                test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
                loader: "url-loader?limit=10000&mimetype=application/font-woff"
            },
            {
                test: /\.(ttf|otf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
                loader: "file-loader"
            }
        ]
    },
    'plugins': [
        // Add jQuery aliases
        new webpack.ProvidePlugin({
            $: 'jquery',
            jQuery: 'jquery'
        }),
        // Direct copy the static index and robots files
        new CopyWebpackPlugin([
            { from: './static/index.html' },
            { from: './static/robots.txt' },
            { from: './static/images/favicon', to: 'favicon' }
        ]),
        // Extract CSS in a dedicated file
        new ExtractTextPlugin({
            filename: 'main.css',
            disable: false,
            allChunks: true
        }),
        // Only keep the useful locales from Moment
        new webpack.ContextReplacementPlugin(/moment[\/\\]locale$/, locales)
    ]
}
