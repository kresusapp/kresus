#!/bin/bash

# Prepares for a Docker nightly image.

set -e

docker build --no-cache -t bnjbvr/kresus-nightly -f support/docker/Dockerfile-nightly ./support/docker
