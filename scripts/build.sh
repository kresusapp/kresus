#!/bin/bash

rm -rf ./build/

echo "Copying static files..."
mkdir -p ./build/client
cp -r ./static/* ./build/client

echo "Concatening and copying CSS..."
mkdir -p ./build/client/css
./scripts/build-css.sh

echo "Concatening and copying vendor JS..."
mkdir -p ./build/client/js
./scripts/build-vendor-js.sh

echo "Building client JS..."
./node_modules/browserify/bin/cmd.js ./client/main.js -v \
    -t [ babelify --presets es2015,react --plugins transform-runtime ] \
    -o ./build/client/js/main.js

echo "Copying shared files..."
mkdir -p ./build/server/shared
cp -r ./shared/* ./build/server/shared

./node_modules/babel-cli/bin/babel.js \
    --presets es2015,stage-0 \
    --plugins transform-runtime \
    ./shared/ \
    -d ./build/server/shared

echo "Building server JS..."
mkdir -p ./build/server
./node_modules/babel-cli/bin/babel.js \
    --presets es2015,stage-0 \
    --plugins transform-runtime \
    ./server/ \
    -d ./build/server

echo "Copying Weboob endpoint..."
mkdir -p ./build/server/weboob
cp ./server/weboob/main.py ./build/server/weboob/ && chmod +x ./build/server/weboob/main.py

echo "Done!"
