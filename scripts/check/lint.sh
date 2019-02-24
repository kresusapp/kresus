#!/bin/bash
set -e

FIX=""
QUIET="--quiet"
TARGET=""

while [[ $# -gt 0 ]]
do
key="$1"
case $key in
    -v|--verbose)
    QUIET=""
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
    TARGET="./server ./client ./tests"
fi

concurrently \
    "yarn run check:package-json" \
    "yarn run -- eslint --cache $QUIET $FIX $TARGET"\
    "yarn run check:lint-css $QUIET $FIX"
