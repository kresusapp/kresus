#!/bin/bash
set -e

yarn run build:server-common

concurrently -k \
    "./scripts/watch/client.sh" \
    "./scripts/watch/server.sh"
