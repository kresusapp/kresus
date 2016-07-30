#!/bin/bash

# Lint
./scripts/lint.sh ./ && \
# Compare locales
./node_modules/babel-cli/bin/babel-node.js --presets es2015 ./scripts/compare-locales.js && \
# Run proper tests
./node_modules/mocha/bin/mocha tests/ --recursive --require babel-register && \
# Add new tests here
echo "PASS!"
