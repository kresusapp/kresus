#!/bin/bash

./node_modules/babel-cli/bin/babel.js \
    --presets es2015,stage-0 \
    --plugins transform-runtime ./server/ \
    -d ./build/server
