#!/usr/bin/env node

// Pollute global scope with Babel polyfills prior to anything else.
// Note: eslint doesn't like unassigned imports.
/* eslint-disable */
require('babel-polyfill');
/* eslint-enable */

// Import the server.
var path = require('path');
var root = path.join(path.dirname(fs.realpathSync(__filename)), '..', 'build');
var server = require(path.join(root, 'server'));

// Start the server
server.start();
