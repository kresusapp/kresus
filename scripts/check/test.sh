#!/bin/bash
set -e

TARGET=""

while [[ $# -gt 0 ]]
do
    key="$1"
    TARGET="$TARGET $key"
    shift # past argument or value
done

if [ "$TARGET" == "" ]
then
    TARGET="./tests"
fi

# Run proper tests
BABEL_ENV=tests NODE_ENV=test mocha \
    --require @babel/polyfill \
    --require @babel/register \
    --file ./tests/database/config.js \
    --recursive $TARGET \
    --ignore ./tests/fixtures \
    --timeout 120000
