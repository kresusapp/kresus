#!/bin/bash
set -e

concurrently -k \
    "yarn run onchange './shared/*.json' -v -- cp '{{changed}}' ./build/server/shared" \
    "yarn run onchange './shared/locales/*.json' -v -- cp '{{changed}}' ./build/server/shared/locales" \
    "yarn run onchange './server/weboob/**/*.py' -v -- cp './{{changed}}' './build/{{changed}}'" \
    "yarn run babel --skip-initial-build ./server/ -d ./build/server -w"
