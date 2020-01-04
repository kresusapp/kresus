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

# tsc returns an error code equal to 2 when it emitted files, but with some
# type errors. During the migration to typescript, it's expected to have those.
yarn run -- tsc || [ $? -eq 2 ]

echo "Done!"
