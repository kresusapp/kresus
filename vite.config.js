import { defineConfig } from 'vite';

import plainText from 'vite-plugin-plain-text';
import sprites from 'rollup-plugin-sprite';
import reactRefresh from 'vite-plugin-react-refresh'

// NOTE: Known workarounds:
// - install the `indexof` package, to work around a similar issue to what's
// described in https://github.com/vitejs/vite/issues/1339.

export default defineConfig({
    // Allow dynamic sub-path (e.g. serving from /money).
    base: './',

    // Root directory of all the assets (notably, index.html) is client/.
    root: './client',

    build: {
        // Where to build assets, relative to root dir.
        outDir: '../build/client',
    },

    resolve: {
        alias: {
            // Alias so the base.css file can refer to the sprite directly.
            './sprite.css': './client/static/sprite/sprite.css',
        }
    },

    plugins: [
        // React hot-module reload.
        reactRefresh(),

        // Interpret the LICENSE file as plain text that must be included.
        plainText(/LICENSE/),

        // Generate sprites for the bank icons.
        sprites({
            src: {
                // Where the original files are located.
                cwd: './client/static/images/banks',
                // Which files should be matched there.
                glob: '*.png'
            },
            target: {
                // Where to build the resulting png.
                image: './client/bank-sprite.png',
                // Where to build the css file.
                css: './client/static/sprite/sprite.css'
            },
            // Computed path to the image, in the CSS file.
            cssImageRef: "./bank-sprite.png",
            output: {
                // A copy of the png, for the build directory (this plugin's
                // output isn't duplicated, somehow).
                image: './build/client/assets/bank-sprite.png'
            }
        }),
    ],

    server: {
        // Proxy the API and the manifest file straight to the server.
        proxy: {
            '/api': {
                target: 'http://127.0.0.1:9876/',
            },
            '/manifest': {
                target: 'http://127.0.0.1:9876/',
            },
        },

        // Just pretend you're webpack.
        port: 8080,
    }
});
