#!/bin/sh
# Parse a JSON output from Webpack to find why a given module was imported.
# Requires jq and an `ANALYZE=true` build of the client code.

# Go to Kresus root
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd $DIR/..

# Analyze
cat build/reports/client.json | jq ".chunks[] .modules[] | select(.name | contains(\"$1\"))"
