#!/bin/bash

python -c "from weboob.core import WebNip; WebNip()" && exit

cd weboob && source ./env/bin/activate && python -c "from weboob.core import WebNip; WebNip()"

