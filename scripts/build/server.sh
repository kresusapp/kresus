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

echo "Copying Woob python code..."
mkdir -p ./build/server/providers/woob
cp -r ./server/providers/woob/py ./build/server/providers/woob
chmod +x ./build/server/providers/woob/py/main.py

echo "Building server JS..."
mkdir -p ./build/server

# Force to build everything, since dist directory was deleted
# and output would be incomplete due to incremental mode.
# "--force" overrides incremental directive in tsconfig.json
yarn run -- tsc --build --force

echo "Done!"
