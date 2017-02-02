#!/bin/bash

cat ./node_modules/bootstrap/dist/css/bootstrap.css \
    ./node_modules/bootstrap/dist/css/bootstrap-theme.css \
    ./client/css/*.css \
    ./client/css/**/*.css \
    ./node_modules/dygraphs/dist/dygraph.css \
    ./node_modules/c3/c3.css \
    ./node_modules/jquery-minicolors/jquery.minicolors.css |
    ./node_modules/.bin/minify --css > ./build/client/css/main.css
