#!/bin/bash

# Run proper tests
./node_modules/mocha/bin/mocha ./tests/ --recursive --require babel-register
