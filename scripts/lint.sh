#!/bin/bash

if [ $# == 0 ]
then
  to_lint="./server ./client ./shared"
else
  to_lint=$1
fi

./node_modules/eslint/bin/eslint.js $to_lint
