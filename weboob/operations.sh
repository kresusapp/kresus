#!/bin/bash

cd weboob
source env/bin/activate
python operations.py | while read x ; do echo $x ; done
