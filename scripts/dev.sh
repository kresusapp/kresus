#!/bin/bash

concurrently -k \
    "npm run nodemon -- --watch ./build/server --watch ./bin/kresus.js ./bin/kresus.js -- --config config.ini"
