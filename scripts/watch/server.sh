#!/bin/bash
set -e

concurrently -k \
    "yarn run -- onchange './shared/*.json' -- cp '{{changed}}' ./build/server/shared" \
    "yarn run -- onchange './shared/locales/*.json' -- cp '{{changed}}' ./build/server/shared/locales" \
    "yarn run -- onchange './server/weboob/**/*.py' -- cp './{{changed}}' './build/{{changed}}'" \
    "TSC_WATCHFILE=UseFsEventsWithFallbackDynamicPolling yarn run tsc -w --incremental --preserveWatchOutput"
