#!/bin/bash
set -e

NODE_ENV=production concurrently \
    "yarn run vite build --mode production" \
    "yarn run build:server"
