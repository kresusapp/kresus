#!/bin/bash
set -e

babel-node --presets @babel/env ./scripts/js/config.js generate
