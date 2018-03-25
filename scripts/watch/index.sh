#!/bin/bash
set -e

yarn build:server

concurrently -k \
    "./scripts/watch/client.sh" \
    "./scripts/watch/server.sh"
