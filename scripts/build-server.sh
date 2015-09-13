#!/bin/bash

# Blacklist the "spec.functionName" transformer, because of a bug in
# cozy-db-pouchdb. See also https://github.com/cozy/cozy-db/issues/33
./node_modules/babel/bin/babel.js --optional 'runtime' -b 'spec.functionName' ./server/ -d ./build/server
