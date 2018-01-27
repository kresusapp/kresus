#!/bin/bash
set -e

npm run build:dev

concurrently -k \
    "npm run watch:client" \
    "npm run watch:server"
