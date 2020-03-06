#!/bin/bash
set -e

# Default to development
if [ -z "$NODE_ENV" ]
then
    NODE_ENV="development"
fi
echo "Building in $NODE_ENV mode..."

yarn build:server-common

echo "Building server JS..."
mkdir -p ./build/server

yarn run -- tsc

echo "Done!"
