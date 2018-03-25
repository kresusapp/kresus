#!/bin/bash
set -e

NODE_ENV=production concurrently \
    "yarn run webpack -p" \
    "yarn run build:server"
