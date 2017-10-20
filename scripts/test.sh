#!/bin/bash
set -e

# Run proper tests
BABEL_ENV=tests nyc --require babel-register --reporter text --source-map false --instrument false --exclude "tests/**" mocha --recursive ./tests
