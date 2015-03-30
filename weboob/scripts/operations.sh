#!/bin/bash

cd weboob
source env/bin/activate
python py/operations.py | while read x ; do echo $x ; done
