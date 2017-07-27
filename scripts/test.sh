#!/bin/bash
set -e

# Compare locales
./node_modules/babel-cli/bin/babel-node.js --presets es2015 ./scripts/compare-locales.js
# Check all bank related data is correct (logo, translation keys ...)
./node_modules/babel-cli/bin/babel-node.js --presets es2015 ./scripts/check-banks.js
# Run proper tests
./node_modules/mocha/bin/mocha ./tests/ --recursive --require babel-register
