#!/bin/bash
set -e

# Run proper tests
BABEL_ENV=tests mocha --require babel-polyfill --compilers js:babel-register --recursive ./tests
