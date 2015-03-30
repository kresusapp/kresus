#!/bin/bash

cd weboob
rm -rf env
mkdir -p ./env && virtualenv ./env && source ./env/bin/activate && pip install -r requirements.txt && cd .. && ./weboob/scripts/test.sh
