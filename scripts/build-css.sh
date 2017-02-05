#!/bin/bash
cat ./node_modules/normalize.css/normalize.css \
    ./node_modules/font-awesome/css/font-awesome.css \
    ./node_modules/bootstrap/dist/css/bootstrap.css \
    ./node_modules/bootstrap/dist/css/bootstrap-theme.css \
    ./client/css/*.css \
    ./node_modules/dygraphs/dist/dygraph.css \
    ./node_modules/c3/c3.css \
    ./node_modules/pickadate/lib/themes/classic.css \
    ./node_modules/pickadate/lib/themes/classic.date.css \
    ./node_modules/pickadate/lib/themes/classic.time.css \
    ./node_modules/jquery-minicolors/jquery.minicolors.css > ./build/client/css/main.css
