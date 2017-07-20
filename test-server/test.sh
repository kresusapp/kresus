#!/bin/bash
set -e

# Go to this script directory
cd "$(dirname "$(realpath "$0")")";

# Ensure reports output directory exists
mkdir -p ../build/reports

# Run the tests
KRESUS_DIR=$(mktemp -d -t kresus-test) NODE_ENV=tests ../node_modules/.bin/babel-node ./test-server-api-v1.js
