#!/bin/bash
set -e

./scripts/lint.sh --quiet
./scripts/test.sh
echo "PASS!"
