#!/bin/bash
set -e

mkdir -p ./build
mkdir -p ./build/server
mkdir -p ./build/server/shared

# Shared code
(./node_modules/onchange/cli.js "./shared/*.json" -iv -- cp -r ./shared/*.json ./build/server/shared) &

# Server JS
(./node_modules/babel-cli/bin/babel.js \
    --presets es2015,stage-0 \
    --plugins transform-runtime \
    ./server/ \
    -d ./build/server \
    -w) &

# Server py
(./node_modules/onchange/cli.js "./server/weboob/main.py" -iv -- cp ./server/weboob/main.py ./build/server/weboob && chmod +x ./build/server/weboob/main.py) &

wait
