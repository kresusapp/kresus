#!/bin/bash

rm -rf ./build/

echo "Copying static files..."
mkdir -p ./build/client
cp -r ./static/* ./build/client
cp package.json ./build/

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

echo "Building server JS..."
mkdir -p ./build/server
./node_modules/babel-cli/bin/babel.js \
    --presets es2015,stage-0 \
    --plugins transform-runtime \
    ./server/ \
    -d ./build/server

echo "Setting permissions on weboob's directory..."
if id -u "cozy-kresus" >/dev/null 2>&1; then
    if ! chown cozy-kresus:cozy-kresus -R ./weboob; then
        echo "chown returned a non zero exit status. Make sure of the following:
        - the weboob/ directory exists
        - you have the rights to change the owner of the weboob/ subdir"
    fi
fi

echo "Done!"

