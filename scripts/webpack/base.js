const fs = require('fs');
const path = require('path');
const webpack = require('webpack');

const CopyWebpackPlugin = require('copy-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const SpritesmithPlugin = require('webpack-spritesmith');
const GenerateJsonPlugin = require('generate-json-webpack-plugin');

// List available locales, to fetch only the required locales from Moment.JS:
// Build a regexp that selects the locale's name without the JS extension (due
// to the way moment includes those) and ensure that's the last character to
// not include locale variants. See discussion in
// https://framagit.org/bnjbvr/kresus/merge_requests/448#note_130514
const locales = fs.readdirSync('shared/locales').map(
    x => x.replace('.json', '')
);
const localesRegex = new RegExp(
    '(' + locales.join('|') + ')$'
);

let entry = {
    main: [
        'babel-polyfill',
        './node_modules/normalize.css/normalize.css',
        './node_modules/font-awesome/css/font-awesome.css',
        './node_modules/bootstrap-kresus/css/bootstrap.css',
        './node_modules/bootstrap-kresus/css/bootstrap-theme.css',
        './node_modules/dygraphs/dist/dygraph.css',
        './node_modules/c3/c3.css',
        './node_modules/flatpickr/dist/themes/light.css',
        './node_modules/react-select/dist/react-select.css',
        './client/css/base.css',
        './node_modules/bootstrap-kresus/js/bootstrap.js',
        './client/init.js'
    ]
};

const themes = fs.readdirSync('client/themes').filter(
    f => fs.statSync(`client/themes/${f}`).isDirectory()
);

themes.forEach(theme => {
    entry[`themes/${theme}`] = `./client/themes/${theme}/style.css`;
});

// These extra locales should be put after the main client entrypoint to ensure
// that all the scripts are loaded and `window` is populated before trying to
// append locales to these objects.
locales.forEach(locale => {
    if (locale !== 'en') {
        // Flatpickr locales entries
        entry.main.push(`flatpickr/dist/l10n/${locale}.js`);
    }
});

// Webpack config
const config = {
    entry: entry,

    output: {
        path: path.resolve(__dirname, '..', '..', 'build', 'client'),
        filename: '[name].js',
    },

    module: {
        loaders: [
            {
                test: /\.js$/,
                // Exclude all but dygraphs
                // Dygraphs ships ES5 files with arrow functions by default, so
                // we need to pass Babel on them
                exclude: /node_modules(?!\/dygraphs)/,
                use: {
                    loader: 'babel-loader'
                }
            },

            {
                test: /\.json$/,
                include: /shared\/locales/,
                use: [
                    {
                        loader: 'json-strip-loader',
                        query: {
                            key: 'server',
                            deep: false
                        }
                    }
                ]
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
                use: [
                    {
                        loader: 'file-loader',
                        query: {
                            name: 'assets/images/[sha512:hash:hex].[ext]'
                        }
                    },
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
                test: /\.woff2?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
                use: [
                    {
                        loader: 'url-loader',
                        query: {
                            limit: 10000,
                            mimetype: 'application/font-woff',
                            name: 'assets/fonts/[name]-[hash].[ext]'
                        }
                    }
                ]
            },

            {
                test: /\.(ttf|otf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
                use: [
                    {
                        loader: 'file-loader',
                        query: {
                            name: 'assets/fonts/[name]-[sha512:hash:hex].[ext]'
                        }
                    }
                ]
            }
        ]
    },

    devServer: {
        disableHostCheck: true,
        host: "0.0.0.0",
        proxy: {
            "/api": "http://localhost:9876/",
            "/manifest": "http://localhost:9876/"
        }
    },

    resolve: {
        modules: ['node_modules', 'build/spritesmith-generated']
    },

    plugins: [
        // Add jQuery aliases.
        new webpack.ProvidePlugin({
            $: 'jquery',
            jQuery: 'jquery'
        }),

        // Directly copy the static index and robots files.
        new CopyWebpackPlugin([
            { from: './static/index.html' },
            { from: './static/robots.txt' },
            { from: './static/images/favicon', to: 'favicon' }
        ]),

        // Extract CSS in a dedicated file.
        new ExtractTextPlugin({
            filename: getPath => {
                let pathname = getPath('[name]');
                // Entries names with '/' refer to themes paths.
                if (pathname.indexOf('/') !== -1) {
                    return `${pathname.replace('/', '-')}-bundle.css`;
                }
                return `${pathname}.css`;
            },
            disable: false,
            allChunks: true
        }),

        // Build bank icons sprite.
        new SpritesmithPlugin({
            src: {
                cwd: path.resolve(__dirname, '..', '..', 'static', 'images', 'banks'),
                glob: '*.png'
            },
            target: {
                image: path.resolve(__dirname, '..', '..', 'build', 'spritesmith-generated', 'sprite.png'),
                css: path.resolve(__dirname, '..', '..', 'build', 'spritesmith-generated', 'sprite.css')
            },
            apiOptions: {
                cssImageRef: '~sprite.png'
            }
        }),

        // Only keep the useful locales from Moment.
        new webpack.ContextReplacementPlugin(/moment[\/\\]locale$/, localesRegex),

        // Generate a themes.json file with the list of themes.
        new GenerateJsonPlugin('themes.json', {themes: themes})
    ]
}

if (process.env.ANALYZE) {
    const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
    config.plugins.push(
        // Generate analyzer reports if needed
        new BundleAnalyzerPlugin({
            // Can be `server`, `static` or `disabled`.
            // In `server` mode analyzer will start HTTP server to show bundle report.
            // In `static` mode single HTML file with bundle report will be generated.
            // In `disabled` mode you can use this plugin to just generate Webpack Stats JSON file by setting `generateStatsFile` to `true`.
            analyzerMode: 'static',

            // Path to bundle report file that will be generated in `static` mode.
            // Relative to bundles output directory.
            reportFilename: '../reports/client.html',

            // Module sizes to show in report by default.
            // Should be one of `stat`, `parsed` or `gzip`.
            // See "Definitions" section for more information.
            defaultSizes: 'parsed',

            // Automatically open report in default browser
            openAnalyzer: true,

            // If `true`, Webpack Stats JSON file will be generated in bundles output directory
            generateStatsFile: true,

            // Name of Webpack Stats JSON file that will be generated if `generateStatsFile` is `true`.
            // Relative to bundles output directory.
            statsFilename: '../reports/client.json',
        })
    );
}

module.exports = config;
