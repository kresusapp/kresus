#!/bin/bash

set -e

TARGET_REPO="https://framagit.org/bnjbvr/kresus"
TARGET_BRANCH="master"

git remote |
{
    while read remote
    do
        if [ `git remote get-url $remote | grep -e $TARGET_REPO` ]
        then
            REMOTE_NAME=$remote
            break;
        fi
    done

    if [ "$REMOTE_NAME" == '' ]
    then
        git remote add upstream-kresus $TARGET_REPO -f
        REMOTE_NAME='upstream-kresus'
    fi

    # Ensure the remote is up to date.
    git fetch $REMOTE_NAME
    git rebase $REMOTE_NAME/$TARGET_BRANCH -x "git log -1 --oneline && npm install && npm run check"
}
