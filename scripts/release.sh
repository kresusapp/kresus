#!/bin/bash

while true; do
    read -p "Have you checked that you have updated the version number in package.json?" yn
    case $yn in
        [Yy]* ) break;;
        [Nn]* ) exit;;
        * ) echo "Please answer yes or no.";;
    esac
done

echo "Checking dependencies are up to date..."
while true; do
    ./node_modules/.bin/ncu
    read -p "Are you sure you don't want to upgrade these dependencies?" yn
    case $yn in
        [Yy]* ) break;;
        [Nn]* ) read -p "Upgrade the dependencies in package.json and hit ENTER to proceed"; continue;;
        * ) echo "Please answer yes or no.";;
    esac
done

echo "Removing node_modules for ensuring dev dependencies..."
rm -rf node_modules/
yarn

echo "Building..."
NODE_ENV=production make build
rm -rf build/server/weboob/data

echo "Minifying javascript..."
./scripts/minify.sh

git add -f build/

echo "Removing dev dependencies and installing production dependencies before shrinkwrap..."
rm -rf node_modules/ npm-shrinkwrap.json
npm install --production # yarn doesn't allow shrinkwrap.

npm shrinkwrap
git add npm-shrinkwrap.json

git status

echo "This is what is about to be committed. Check this and commit."
echo "Then, do:"
echo "     $ npm publish"
echo "     $ docker build -t bnjbvr/kresus . && docker push bnjbvr/kresus"
