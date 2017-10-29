#!/bin/bash
set -e

find server -name "*.py" | while read f
do
    echo $f
    pylint --rcfile=.pylintrc $f
    if [ $? -ne 0 ]
    then
        break
    fi
done
