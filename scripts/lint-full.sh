#!/bin/bash

if [ $# == 0 ]
then
  target="./server ./client"
else
  target=$1
fi

# Lint + warnings.
./node_modules/eslint/bin/eslint.js $target

# Check package.json specificatins
RED='\033[0;31m'
NC='\033[0m'

if `cat package.json| jq '.dependencies[],.devDependencies[] | (contains("^") or contains("~"))' | grep true > /dev/null`; then
    echo -e "${RED}You have a version in your package.json which is not exact.${NC}"
    exit 1
fi
