#!/bin/bash
set -e

concurrently \
    "npm run check:lint" \
    "npm run check:banks" \
    "npm run check:locales" \
    "npm run check:test"
