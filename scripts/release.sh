#!/bin/bash

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
yarn

echo "Building..."
NODE_ENV=production make build
rm -rf build/server/weboob/data

echo "Minifying client..."

echo "Minifying main.js"
mv ./build/client/js/main.js ./build/client/js/main.back.js
cat ./build/client/js/main.back.js | ./node_modules/.bin/minify --js > ./build/client/js/main.js
rm ./build/client/js/main.back.js

echo "Minifying vendor.js"
mv ./build/client/js/vendor.js ./build/client/js/vendor.back.js
cat ./build/client/js/vendor.back.js | ./node_modules/.bin/minify --js > ./build/client/js/vendor.js
rm ./build/client/js/vendor.back.js


echo "Minifying main.css"
mv ./build/client/css/main.css ./build/client/css/main.back.css
cat ./build/client/css/main.back.css | ./node_modules/.bin/minify --css > ./build/client/css/main.css
rm ./build/client/css/main.back.css

# Avoid shipping unused files
echo "Deleting sprite.css"
rm ./build/client/css/sprite.css

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
