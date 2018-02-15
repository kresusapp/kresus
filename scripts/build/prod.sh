#!/bin/bash

NODE_ENV=production concurrently \
    "npm run webpack -- -p" \
    "npm run build:server"
