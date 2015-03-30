#!/bin/bash

cd weboob
source env/bin/activate
python py/accounts.py | while read x ; do echo $x ; done
