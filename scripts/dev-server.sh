#!/bin/bash
set -e

# Clear directories
rm -rf ./build/server

# Create directories
mkdir -p ./build/server
mkdir ./build/server/weboob
mkdir ./build/server/shared
mkdir ./build/server/shared/locales

# Shared code
# Initial build, required because {{changed}} is not filled at initial run.
echo "Copying locales and shared files..."
cp ./shared/*.json ./build/server/shared
cp ./shared/locales/*.json ./build/server/shared/locales
(./node_modules/onchange/cli.js "./shared/*.json" -v -- cp '{{changed}}' ./build/server/shared) &
(./node_modules/onchange/cli.js "./shared/locales/*.json" -v -- cp '{{changed}}' ./build/server/shared/locales) &

# Server JS
(./node_modules/babel-cli/bin/babel.js \
    --presets env,stage-0 \
    ./server/ \
    -d ./build/server \
    -w) &

# Server py
(./node_modules/onchange/cli.js "./server/weboob/main.py" -iv -- cp ./server/weboob/main.py ./build/server/weboob/ && chmod +x ./build/server/weboob/main.py) &

wait
