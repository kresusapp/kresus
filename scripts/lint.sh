#!/bin/bash

if [ $# == 0 ]
then
  target="./server ./client"
else
  target=$1
fi

# Lint errors only.
./node_modules/eslint/bin/eslint.js --quiet $target
