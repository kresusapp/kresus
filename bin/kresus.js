#!/usr/bin/env node

var path = require('path-extra');
var fs = require('fs');

var mainDir = process.env.KRESUS_DIR
              ? process.env.KRESUS_DIR
              : path.join(path.homedir(), '.kresus');

var defaultDbPath = path.join(mainDir, 'db');

if (!fs.existsSync(mainDir)) {
    fs.mkdirSync(mainDir);
}

function copyFiles(fromDir, toDir) {
    fs.readdirSync(fromDir).forEach(function(child) {
        var from = path.join(fromDir, child);
        var to = path.join(toDir, child);
        if (fs.statSync(from).isDirectory()) {
            if (!fs.existsSync(to)) {
                fs.mkdirSync(to);
            }
            // Don't copy the python env
            if (child !== 'env') {
                copyFiles(from, to);
            }
        } else if (!fs.existsSync(to)) {
            var wr = fs.createWriteStream(to);
            fs.createReadStream(from).pipe(wr);
            wr.on('close', function() { fs.chmodSync(to, 0755); });
        }
    });
}

var weboobSrc = path.join(path.dirname(fs.realpathSync(__filename)), '..', 'weboob');
var weboobDest = path.join(mainDir, 'weboob');
if (!fs.existsSync(weboobDest)) {
    fs.mkdirSync(weboobDest);
}
copyFiles(weboobSrc, weboobDest);

process.chdir(mainDir);

process.env.NODE_ENV = 'production';
process.kresus = process.kresus || {};
process.kresus.standalone = true;

var root = path.join(path.dirname(fs.realpathSync(__filename)), '..', 'build');
var start = require(path.join(root, 'server'));

var opts = {
    root: root,
    port: process.env.PORT || 9876,
    dbName: defaultDbPath
};

start(opts, function() {});
