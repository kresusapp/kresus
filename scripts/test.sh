#!/bin/bash

# Lint
./scripts/lint.sh ./server

# Compare locales
./node_modules/babel-cli/bin/babel-node.js --presets es2015 ./scripts/compare-locales.js
