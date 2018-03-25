#!/bin/bash

concurrently \
    "npm run check:lint" \
    "npm run check:banks" \
    "npm run check:locales" \
    "npm run check:test"
