let application = (options = {}, callback) => {

    let americano  = require('americano');
    let path       = require('path-extra');
    let init       = require('./init');

    options.name   = 'Kresus';
    options.root   = options.root || path.join(__dirname, '..');
    options.port   = process.env.PORT || 9876;
    options.host   = process.env.HOST || "127.0.0.1";
    options.dbName = process.env.POUCHDB_NAME; // can be undefined

    americano.start(options, (err, app, server) => {
        init(app, server, callback);
    });
};

if (typeof module.parent === 'undefined' || !module.parent)
    application();

export default application;
