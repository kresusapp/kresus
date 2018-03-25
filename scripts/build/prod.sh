#!/bin/bash
set -e

NODE_ENV=production concurrently \
    "yarn webpack -p" \
    "yarn build:server"
