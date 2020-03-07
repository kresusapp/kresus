#!/bin/bash
set -e

TS_NODE_TRANSPILE_ONLY=true ts-node --files ./scripts/js/locales.js
