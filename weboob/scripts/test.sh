#!/bin/bash

# Check for Python'n binary (if not installed, we abort)
pyth=$(which python || which python2 || echo "")
if [[ -z $pyth ]]
then
    echo "Python is not installed"
    exit 1
fi

$pyth -c "from weboob.core import WebNip; WebNip()" && exit

cd weboob && source ./env/bin/activate && $pyth -c "from weboob.core import WebNip; WebNip()"

