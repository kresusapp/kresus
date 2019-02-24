#!/bin/bash
set -e

babel-node --presets @babel/preset-env ./scripts/js/config.js check
