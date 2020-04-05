#!/bin/bash
set -e

yarn run build:server

concurrently -k \
    "yarn run -- onchange './shared/*.json' -- cp '{{changed}}' ./build/server/shared" \
    "yarn run -- onchange './shared/locales/*.json' -- cp '{{changed}}' ./build/server/shared/locales" \
    "yarn run -- onchange './server/providers/weboob/**/*.py' -- cp './{{changed}}' './build/{{changed}}'" \
    "TSC_WATCHFILE=UseFsEventsWithFallbackDynamicPolling yarn run tsc -w --incremental --preserveWatchOutput" \
    "yarn run webpack-dev-server" \
    "yarn run -- nodemon --watch ./build/server --watch ./bin/kresus.js ./bin/kresus.js -- --config config.ini"
