#!/bin/bash

npm run build:server

concurrently -k \
    "npm run webpack-dev-server -- --host 0.0.0.0 --disable-host-check" \
    "./scripts/watch/server.sh" \
    "npm run nodemon -- --watch ./build/server --watch ./bin/kresus.js ./bin/kresus.js -- --config config.ini"
