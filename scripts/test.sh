#!/bin/bash

# Lint
./scripts/lint.sh ./server && \
./scripts/lint.sh ./client/components/categories && \
./scripts/lint.sh ./client/components/duplicates && \
./scripts/lint.sh ./client/components/init && \
./scripts/lint.sh ./client/components/menu && \
./scripts/lint.sh ./client/components/operations && \
./scripts/lint.sh ./client/components/settings && \
# Compare locales
./node_modules/babel-cli/bin/babel-node.js --presets es2015 ./scripts/compare-locales.js && \
# Add new tests here
echo "PASS!"
