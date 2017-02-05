#!/bin/bash
 cat ./node_modules/jquery/dist/jquery.js \
     ./node_modules/jquery-minicolors/jquery.minicolors.js \
     ./node_modules/pickadate/lib/picker.js \
     ./node_modules/pickadate/lib/picker.date.js \
     ./node_modules/pickadate/lib/picker.time.js \
     ./client/vendor/*.js \
     ./node_modules/bootstrap-kresus/js/bootstrap.js > ./build/client/js/vendor.js
