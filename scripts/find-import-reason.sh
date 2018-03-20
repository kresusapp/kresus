#!/bin/sh
# Parse a JSON output from Webpack to find why a given module was imported.
# Requires jq and an `ANALYZE=true` build of the client code.
set -e

# Go to Kresus root
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd $DIR/..

# Analyze
cat build/reports/client.json | jq '.chunks[] .modules[] | select(.name | contains($SEARCH)) as $mod | .reasons[] | select(.moduleName | contains($SEARCH) | not) | .moduleName + "," + $mod.name' --arg SEARCH $1 | \
    (echo "Source file,Included file" && cat) | sed -e 's/^"//' -e 's/"$//' | column -t -s","
