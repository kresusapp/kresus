#!/bin/bash

concurrently -k \
    "npm run onchange -- './shared/*.json' -v -- cp '{{changed}}' ./build/server/shared" \
    "npm run onchange -- './shared/locales/*.json' -v -- cp '{{changed}}' ./build/server/shared/locales" \
    "npm run onchange -- './server/weboob/**/*.py' -v -- cp './{{changed}}' './build/{{changed}}'" \
    "npm run babel -- --skip-initial-build ./server/ -d ./build/server -w"
