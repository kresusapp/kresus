#!/bin/bash

# Lint
./scripts/lint.sh && \
# Compare locales
./node_modules/babel-cli/bin/babel-node.js --presets es2015 ./scripts/compare-locales.js && \
# Check all banks have a logo
./node_modules/babel-cli/bin/babel-node.js --presets es2015 ./scripts/check-logos.js && \
# Run proper tests
./scripts/test.sh && \
# Add new tests here
echo "PASS!"
