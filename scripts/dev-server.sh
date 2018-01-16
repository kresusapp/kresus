#!/bin/bash
set -e

# Clear directories
rm -rf ./build/server

# Create directories
mkdir -p ./build/server
mkdir ./build/server/shared
mkdir ./build/server/shared/locales

# Shared code
# Initial build, required because {{changed}} is not filled at initial run.
echo "Copying locales and shared files..."
cp ./shared/*.json ./build/server/shared
cp ./shared/locales/*.json ./build/server/shared/locales
(./node_modules/onchange/cli.js "./shared/*.json" -v -- cp '{{changed}}' ./build/server/shared) &
(./node_modules/onchange/cli.js "./shared/locales/*.json" -v -- cp '{{changed}}' ./build/server/shared/locales) &

# Server JS code
(./node_modules/babel-cli/bin/babel.js ./server/ -d ./build/server -w) &

# Server Weboob code
# Initial build, required because {{changed}} is not filled at initial run.
cp -r ./server/weboob ./build/server/weboob && chmod +x ./build/server/weboob/main.py
(./node_modules/onchange/cli.js "./server/weboob/**/*.py" -v -- cp './{{changed}}' './build/{{changed}}' && chmod +x ./build/server/weboob/main.py) &

wait
