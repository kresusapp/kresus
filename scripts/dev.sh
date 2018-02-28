#!/bin/bash

npm run build:server

concurrently -k \
    "npm run webpack-dev-server" \
    "./scripts/watch/server.sh" \
    "npm run nodemon -- --watch ./build/server --watch ./bin/kresus.js ./bin/kresus.js -- --config config.ini"
