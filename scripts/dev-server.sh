#!/bin/bash
set -e

# Create directories
mkdir -p ./build
mkdir -p ./build/server
mkdir -p ./build/server/shared
mkdir -p ./build/server/shared/locales

# Shared code
# Initial build, required because {{changed}} is not filled at initial run.
echo "Copying locales and shared files..."
cp ./shared/*.json ./build/server/shared
cp ./shared/locales/*.json ./build/server/shared/locales
(./node_modules/onchange/cli.js "./shared/*.json" -v -- cp '{{changed}}' ./build/server/shared) &
(./node_modules/onchange/cli.js "./shared/locales/*.json" -v -- cp '{{changed}}' ./build/server/shared/locales) &

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
