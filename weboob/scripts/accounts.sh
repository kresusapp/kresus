#!/bin/bash

# Check for Python'n binary (if not installed, we abort)
pyth=$(which python || which python2 || echo "")
if [[ -z $pyth ]]
then
    echo "Python is not installed"
    exit 1
fi

cd weboob
source env/bin/activate
args=`while read x ; do echo $x ; done`
$pyth py/endpoint.py << EOF
    account
    $args
EOF
