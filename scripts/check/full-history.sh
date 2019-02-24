#!/bin/bash
set -e

TARGET_REPO="https://framagit.org/kresusapp/kresus"
TARGET_BRANCH="master"

git remote |
{
    while read remote
    do
        if [ `git remote get-url $remote | grep -e $TARGET_REPO` ]
        then
            echo "Remote '$remote' already exists"
            REMOTE_NAME=$remote
            break;
        fi
    done

    if [ "$REMOTE_NAME" == '' ]
    then
        echo "Creating remote 'upstream-kresus'"
        git remote add upstream-kresus $TARGET_REPO
        REMOTE_NAME='upstream-kresus'
    fi

    # Ensure the remote is up to date.
    echo "Fetching '$REMOTE_NAME'"
    git fetch $REMOTE_NAME
    git rebase $REMOTE_NAME/$TARGET_BRANCH -x "git log -1 --oneline && yarn && yarn run check"
}
