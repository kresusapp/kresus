#!/bin/bash
set -e

concurrently \
    "yarn run webpack --mode development" \
    "yarn run build:server"
