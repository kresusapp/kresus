#!/bin/bash

set -e

# Check package.json specifications
./node_modules/babel-cli/bin/babel-node.js --presets env scripts/check-package-json.js

FIX=""
QUIET=""
TARGET=""

while [[ $# -gt 0 ]]
do
key="$1"
case $key in
    -q|--quiet)
    QUIET="--quiet"
    ;;
    -f|--fix)
    FIX="--fix"
    ;;
    *)
    TARGET="$TARGET $key"
    ;;
esac
shift # past argument or value
done

if [ "$TARGET" == "" ]
then
    TARGET="./server ./client"
fi

# Lint + warnings.
./node_modules/eslint/bin/eslint.js $QUIET $FIX $TARGET
