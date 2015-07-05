#!/bin/bash

if id -u "cozy-kresus" >/dev/null 2>&1; then
    if ! chown cozy-kresus:cozy-kresus -R ./weboob; then
        echo "chown returned a non zero exit status. Make sure of the following:
        - the weboob/ directory exists
        - you have the rights to change the owner of the weboob/ subdir"
    fi
fi
