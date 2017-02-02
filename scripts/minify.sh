#!/bin/bash

echo "Minifying main.js"
mv ./build/client/js/main.js ./build/client/js/main.back.js
cat ./build/client/js/main.back.js | ./node_modules/.bin/minify --js > ./build/client/js/main.js
rm ./build/client/js/main.back.js

echo "Minifying vendor.js"
mv ./build/client/js/vendor.js ./build/client/js/vendor.back.js
cat ./build/client/js/vendor.back.js | ./node_modules/.bin/minify --js > ./build/client/js/vendor.js
rm ./build/client/js/vendor.back.js
