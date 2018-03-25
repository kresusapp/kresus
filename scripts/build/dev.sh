#!/bin/bash

concurrently \
    "npm run webpack" \
    "npm run build:server"
