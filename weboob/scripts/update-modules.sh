#!/bin/bash

cd weboob
source ./env/bin/activate && pip install -U -r requirements.txt && cd .. && ./weboob/scripts/test.sh
