#!/bin/bash

cd weboob
source env/bin/activate
python accounts.py | while read x ; do echo $x ; done
