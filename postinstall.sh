#!/bin/bash

if id -u "cozy-kresus" >/dev/null 2>&1; then
    chown cozy-kresus:cozy-kresus -R ./weboob
fi
