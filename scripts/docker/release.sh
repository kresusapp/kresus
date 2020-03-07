#!/bin/bash

# Prepares for a Docker release. Must be done after yarn release.

set -e

docker build --no-cache -t bnjbvr/kresus -f support/docker/Dockerfile-stable ./support/docker
