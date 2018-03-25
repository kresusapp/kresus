#!/bin/bash
set -e

yarn run --silent build:dev
yarn run --silent build:prod
