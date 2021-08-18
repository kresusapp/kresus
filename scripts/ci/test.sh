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
NODE_ENV=test \
TS_NODE_TRANSPILE_ONLY=true \
TS_NODE_COMPILER_OPTIONS='{"jsx": "react"}' \
yarn mocha \
    --require ts-node/register \
    --require ignore-styles \
    --file ./tests/database/config.js \
    --recursive $TARGET \
    --ignore ./tests/fixtures \
    --timeout 120000
