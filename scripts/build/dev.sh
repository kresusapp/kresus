#!/bin/bash
set -e

concurrently \
    "yarn webpack" \
    "yarn build:server"
