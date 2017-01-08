#!/bin/bash

# Compare locales
./node_modules/babel-cli/bin/babel-node.js --presets es2015 ./scripts/compare-locales.js && \
# Check all banks have a logo
./node_modules/babel-cli/bin/babel-node.js --presets es2015 ./scripts/check-logos.js && \
# Run proper tests
./node_modules/mocha/bin/mocha ./tests/ --recursive --require babel-register
