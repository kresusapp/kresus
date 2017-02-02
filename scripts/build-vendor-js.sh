#!/bin/bash
 cat ./node_modules/jquery/dist/jquery.js \
     ./node_modules/bootstrap/dist/js/bootstrap.min.js \
     ./node_modules/jquery.cookie/jquery.cookie.js \
     ./node_modules/jquery-minicolors/jquery.minicolors.js \
     ./client/vendor/*.js \
     ./node_modules/bootstrap/dist/js/bootstrap.min.js \
     ./client/vendor/**/*.js > ./build/client/js/vendor.js
