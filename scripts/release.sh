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

echo "Removing node_modules for ensuring dev dependencies…"
rm -rf node_modules/
(which yarn > /dev/null && yarn) || npm install

echo "Cleaning 'build' directory…"
rm -fr ./build

echo "Updating dependencies licenses…"
npm run fix:licenses
git add client/components/about/dependencies.json

echo "Building…"
npm run build:prod

# Avoid shipping unused files
echo "Deleting temporary sprite files…"
rm -rf ./build/spritesmith-generated

git add -f build/

echo "Removing dev dependencies and installing production dependencies…·"
rm -rf node_modules/ npm-shrinkwrap.json
npm install --omit=dev --legacy-peer-deps

echo "Regenerating package-lock.json…"
npm install --omit=dev --legacy-peer-deps --package-lock-only

git status

echo "This is what is about to be committed. Check this and commit."
echo "Then, do:"
echo "     $ npm publish"
echo "     $ yarn docker:release"
echo "     $ docker push bnjbvr/kresus"
