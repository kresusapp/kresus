#!/bin/bash

# Lint
./scripts/lint.sh ./ && \
# Compare locales
./node_modules/babel-cli/bin/babel-node.js --presets es2015 ./scripts/compare-locales.js && \
# Add new tests here
make build && \
mkdir -p ./build/tests && \
./node_modules/babel-cli/bin/babel.js \
     --presets es2015,stage-0 --plugins transform-runtime \
     ./tests/ -d ./build/tests && \
node_modules/mocha/bin/mocha build/tests/ --recursive && \
echo "PASS!"
