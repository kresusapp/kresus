#!/usr/bin/env node

var ospath = require('ospath');

var path = require('path');
var fs = require('fs');

process.env.KRESUS_DIR = process.env.KRESUS_DIR ||
                         path.join(ospath.home(), '.kresus');

var mainDir = process.env.KRESUS_DIR;
if (!fs.existsSync(mainDir)) {
    fs.mkdirSync(mainDir);
}

process.chdir(mainDir);

process.kresus = process.kresus || {};
process.kresus.standalone = true;

var root = null;
if (process.env.NODE_ENV === 'testing') {
    // Use directly the ES6 sources with babel-node when testing
    root = path.join(path.dirname(fs.realpathSync(__filename)), '..');
} else {
    // Else, always use the built version. babel-node should not be used in
    // production!
    root = path.join(path.dirname(fs.realpathSync(__filename)), '..', 'build');
}
var server = require(path.join(root, 'server'));

var defaultDbPath = path.join(mainDir, 'db');

var opts = {
    root: root,
    port: process.env.PORT || 9876,
    dbName: defaultDbPath
};

module.exports = {
    server: server.start(opts),
    opts: opts
};
