#!/bin/bash
set -e

babel-node --presets @babel/preset-env ./scripts/js/locales.js
