#!/bin/bash
set -e

# Run proper tests
BABEL_ENV=tests mocha --require babel-polyfill --require babel-register --recursive ./tests
