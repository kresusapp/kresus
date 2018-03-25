#!/bin/bash
set -e

concurrently \
    "yarn run webpack" \
    "yarn run build:server"
