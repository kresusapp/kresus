#!/bin/bash

./scripts/lint.sh

./node_modules/babel-cli/bin/babel-node.js --presets es2015 ./scripts/compare-locales.js
