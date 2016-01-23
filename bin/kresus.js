#!/usr/bin/env node

var path = require('path-extra');
var fs = require('fs');

var mainDir = process.env.KRESUS_DIR
              ? process.env.KRESUS_DIR
              : path.join(path.homedir(), '.kresus');

if (!fs.existsSync(mainDir)) {
    fs.mkdirSync(mainDir);
}

process.chdir(mainDir);

process.env.NODE_ENV = 'production';
process.kresus = process.kresus || {};
process.kresus.standalone = true;

var root = path.join(path.dirname(fs.realpathSync(__filename)), '..', 'build');
var start = require(path.join(root, 'server'));

var defaultDbPath = path.join(mainDir, 'db');

var opts = {
    root: root,
    port: process.env.PORT || 9876,
    dbName: defaultDbPath
};

start(opts, function() {});
