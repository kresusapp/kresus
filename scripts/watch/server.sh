#!/bin/bash
set -e

concurrently -k \
    "yarn run -- onchange './shared/*.json' -- cp '{{changed}}' ./build/server/shared" \
    "yarn run -- onchange './shared/locales/*.json' -- cp '{{changed}}' ./build/server/shared/locales" \
    "yarn run -- onchange './server/weboob/**/*.py' -- cp './{{changed}}' './build/{{changed}}'" \
    "yarn run babel --skip-initial-build ./server/ -d ./build/server -w"
