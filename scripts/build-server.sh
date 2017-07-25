#!/bin/bash

# Default to development
if [ -z "$NODE_ENV" ]
then
    NODE_ENV="development"
fi
echo "Building in $NODE_ENV mode..."

rm -rf ./build/server

echo "Copying shared files..."
mkdir -p ./build/server/shared
cp -r ./shared/*.json ./build/server/shared

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
