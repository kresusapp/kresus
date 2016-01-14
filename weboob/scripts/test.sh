#!/bin/bash

python -c "from weboob.core import WebNip; WebNip()" 1>/dev/null 2>&1 && exit

cd weboob && source ./env/bin/activate && python -c "from weboob.core import WebNip; WebNip()"

