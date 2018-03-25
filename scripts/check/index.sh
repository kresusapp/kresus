#!/bin/bash
set -e

concurrently \
    "yarn run check:lint" \
    "yarn run check:banks" \
    "yarn run check:locales" \
    "yarn run check:test"
