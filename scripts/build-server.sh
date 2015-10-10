#!/bin/bash

./node_modules/babel/bin/babel.js --stage 0 --optional 'runtime' ./server/ -d ./build/server
