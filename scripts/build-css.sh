#!/bin/bash
cat ./node_modules/bootstrap/dist/css/bootstrap.min.css \
    ./node_modules/bootstrap/dist/css/bootstrap-theme.min.css \
    ./client/css/*.css ./client/css/**/*.css \
    ./node_modules/c3/c3.css \
    ./node_modules/dygraphs/dist/dygraph.css > ./build/client/css/main.css
