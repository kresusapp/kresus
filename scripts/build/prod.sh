#!/bin/bash
set -e

NODE_ENV=production concurrently \
    "yarn run webpack --mode production" \
    "yarn run build:server"
