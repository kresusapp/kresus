#!/bin/bash

docker build -t bnjbvr/kresus-janitor .

docker run \
    -p 9876 -p 22 \
    -d \
    bnjbvr/kresus-janitor
