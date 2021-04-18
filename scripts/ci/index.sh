#!/bin/bash
set -e

concurrently \
    "yarn run ci:lint" \
    "yarn run ci:banks" \
    "yarn run ci:locales" \
    "yarn run ci:config" \
    "yarn run ci:test" \
    "yarn run ci:ts-client"
