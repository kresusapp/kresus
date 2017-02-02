#!/bin/bash
 cat ./client/vendor/*.js \
    ./node_modules/bootstrap/dist/js/bootstrap.min.js \
    ./client/vendor/**/*.js > ./build/client/js/vendor.js
