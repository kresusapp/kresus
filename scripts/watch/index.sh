#!/bin/bash
set -e

npm run build:server

concurrently -k \
    "./scripts/watch/client.sh" \
    "./scripts/watch/server.sh"
