#!/bin/bash

# Lint
./scripts/lint.sh ./server && \
./scripts/lint.sh ./client/components/categories && \
# Compare locales
./node_modules/babel-cli/bin/babel-node.js --presets es2015 ./scripts/compare-locales.js && \
# Add new tests here
echo "PASS!"
