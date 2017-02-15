#!/usr/bin/env node

var ospath = require('ospath');

var path = require('path');
var fs = require('fs');
var url = require('url');

var mainDir = process.env.KRESUS_DIR ? process.env.KRESUS_DIR
                                     : path.join(ospath.home(), '.kresus');

if (!fs.existsSync(mainDir)) {
    fs.mkdirSync(mainDir);
}

process.chdir(mainDir);

process.env.NODE_ENV = 'production';
process.kresus = process.kresus || {};
process.kresus.standalone = true;

if (typeof process.env.KRESUS_PATHNAME === 'undefined') {
    global.console.error("The env variable KRESUS_PATHNAME should be set");
    process.exit(1);
}

var kresusUrl;
var parseError = false;
try {
    kresusUrl = url.parse(process.env.KRESUS_PATHNAME);
} catch (e) {
    parseError = true;
}

if (parseError || kresusUrl.pathname === null) {
    global.console.error("KRESUS_PATHNAME should be set and should be a valid pathname. For exemple: /path/to/kresus");
    process.exit(1);
}

var root = path.join(path.dirname(fs.realpathSync(__filename)), '..', 'build');
var start = require(path.join(root, 'server'));

var defaultDbPath = path.join(mainDir, 'db');

var opts = {
    root: root,
    port: process.env.PORT || 9876,
    dbName: defaultDbPath
};

start(opts, function() {});
