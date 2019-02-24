#!/bin/bash
set -e

yarn run build:server

concurrently -k \
    "yarn run webpack-dev-server" \
    "./scripts/watch/server.sh" \
    "yarn run -- nodemon --watch ./build/server --watch ./bin/kresus.js ./bin/kresus.js -- --config config.ini"
