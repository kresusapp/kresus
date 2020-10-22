#!/bin/bash
set -e

yarn run build:server

concurrently -k \
    "yarn run -- onchange './shared/*.json' -- cp '{{changed}}' ./build/server/shared" \
    "yarn run -- onchange './shared/locales/*.json' -- cp '{{changed}}' ./build/server/shared/locales" \
    "yarn run -- onchange './server/providers/weboob/**/*.py' -- cp './{{changed}}' './build/{{changed}}'" \
    "yarn tsdev" \
    "yarn run -- webpack serve" \
    "yarn run -- onchange -i -k ./build/server ./bin/kresus.js ./config.ini -- ./bin/kresus.js --config config.ini"
