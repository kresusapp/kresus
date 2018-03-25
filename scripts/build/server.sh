#!/bin/bash
set -e

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

echo "Copying locale files..."
mkdir -p ./build/server/shared/locales
cp -r ./shared/locales/*.json ./build/server/shared/locales

echo "Building server JS..."
mkdir -p ./build/server
yarn run -- babel ./server/ -d ./build/server

echo "Copying Weboob endpoint..."
cp -r ./server/weboob ./build/server/weboob && chmod +x ./build/server/weboob/main.py

echo "Done!"
