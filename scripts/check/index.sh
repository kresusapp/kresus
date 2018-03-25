#!/bin/bash
set -e

concurrently \
    "yarn check:lint" \
    "yarn check:banks" \
    "yarn check:locales" \
    "yarn check:test"
