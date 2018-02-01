#!/bin/bash
set -e

if [ -n "${KRESUS_WEBOOB_DIR}" ]; then
    PYTHONPATH=${PYTHONPATH}:${KRESUS_WEBOOB_DIR}
fi

find server -name "*.py" | while read f
do
    echo $f
    pylint --rcfile=.pylintrc $f
    if [ $? -ne 0 ]
    then
        break
    fi
done
