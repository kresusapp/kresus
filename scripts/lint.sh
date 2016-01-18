#!/bin/bash

if [ $# == 0 ]
then
  target="./server ./client ./shared"
else
  target=$1
fi

./node_modules/eslint/bin/eslint.js $target
