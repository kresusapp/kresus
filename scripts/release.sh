#!/bin/bash
set -e

while true; do
    read -p "Have you checked that you have updated the version number in package.json?" yn
    case $yn in
        [Yy]* ) break;;
        [Nn]* ) exit;;
        * ) echo "Please answer yes or no.";;
    esac
done

echo "Removing node_modules for ensuring dev dependencies..."
rm -rf node_modules/
(which yarn > /dev/null && yarn) || npm install

echo "Building..."
npm run build:prod

# Avoid shipping unused files
echo "Deleting temporary sprite files..."
rm -rf ./build/spritesmith-generated

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
echo "     $ make docker-release"
echo "     $ docker push bnjbvr/kresus"
