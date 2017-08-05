#!/bin/bash
set -e

# Set to this script directory
cd "$(dirname "$(realpath "$0")")";

# Set up a copy of the testing database
rm -rf ~/.kresus-test
cp -r ./test-server-data ~/.kresus-test

# Ensure reports output directory exists
mkdir -p ../build/reports

# Run the tests
KRESUS_DIR=$HOME/.kresus-test NODE_ENV=testing ../node_modules/.bin/babel-node --presets es2015 ./test-server-api-v1.js
