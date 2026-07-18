#!/bin/bash
set -e

FIX=""
BIOME_WRITE=""
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
    BIOME_WRITE="--write"
    ;;
    *)
    TARGET="$TARGET $key"
    ;;
esac
shift # past argument or value
done

if [ "$TARGET" == "" ]
then
    TARGET="./server ./client ./tests ./bin ./shared"
fi

concurrently \
    "yarn run -- eslint --cache $QUIET $FIX $TARGET" \
    "yarn run ci:lint-css $QUIET $FIX" \
    "yarn biome format $BIOME_WRITE"
