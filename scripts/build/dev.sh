#!/bin/bash
set -e

concurrently \
    "yarn run vite build --mode development" \
    "yarn run build:server"
