#!/bin/bash

cd weboob
source env/bin/activate
args=`while read x ; do echo $x ; done`
python py/accounts.py << EOF
    $args
EOF
