#!/bin/bash
set -e

find server -name "*.py" -exec echo '{}' \; -exec pylint --rcfile=.pylintrc '{}' \;
