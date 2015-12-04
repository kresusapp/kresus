import americano from 'americano';
import path from 'path-extra';

import { makeLogger } from './helpers';

let log = makeLogger('index');

let application = (options = {}, callback) => {
    options.name   = 'Kresus';
    options.root   = options.root || path.join(__dirname, '..');
    options.port   = process.env.PORT || 9876;
    options.host   = process.env.HOST || '127.0.0.1';

    // If we try to import 'init', this has to be done at the global scope
    // level. In this case, we will import init and its transitive closure of
    // imports before americano is initialized. As a matter of fact, default
    // parameters of americano will be taken into account (no routes, no
    // models, no standalone cozydb). So the 'init' import has to be
    // synchronous, at the last minute.
    americano.start(options, (err, app, server) => {
        if (err) {
            return log.error(`Error when starting americano: ${ err }`);
        }
        require('./init')(app, server, callback);
    });
};

if (typeof module.parent === 'undefined' || !module.parent)
    application();

module.exports = application;
