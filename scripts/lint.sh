#!/bin/bash
set -e

# Check package.json specifications
./node_modules/babel-cli/bin/babel-node.js scripts/check-package-json.js

QUIET=""
TARGET=""

while [[ $# -gt 0 ]]
do
key="$1"
case $key in
    -q|--quiet)
    QUIET="--quiet"
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
./node_modules/eslint/bin/eslint.js $QUIET $TARGET
