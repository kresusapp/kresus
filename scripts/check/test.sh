#!/bin/bash
set -e

# Run proper tests
BABEL_ENV=tests NODE_ENV=test mocha \
    --require @babel/polyfill \
    --require @babel/register \
    --recursive ./tests \
    --timeout 120000
