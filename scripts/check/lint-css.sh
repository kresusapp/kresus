#!/bin/bash
set -e

FIX=""
QUIET="--quiet"

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
    ;;
esac
shift # past argument or value
done

yarn run -- stylelint --cache $QUIET $FIX "./client/**/*.css"
