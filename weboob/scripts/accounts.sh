#!/bin/bash

cd weboob
source env/bin/activate
args=`while read x ; do echo $x ; done`
python py/endpoint.py << EOF
    account
    $args
EOF
