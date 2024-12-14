#!/bin/bash
set -e

if [ -n "${KRESUS_WOOB_DIR}" ]; then
    export PYTHONPATH=${PYTHONPATH}:${KRESUS_WOOB_DIR}
fi

if ! command -v black &> /dev/null
then
    echo "Black is not installed on this machine."
    exit 1
fi

black --check ./server ./scripts
