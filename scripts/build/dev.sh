#!/bin/bash
set -e

concurrently \
    "npm run webpack" \
    "npm run build:server"
