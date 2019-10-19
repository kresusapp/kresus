/* eslint-disable no-console */

// There's a bug between eslint and prettier with spacing around async arrow
// functions, so we need to explicitly use async functions instead.
/* eslint-disable prefer-arrow-callback */

import PouchDB from 'pouchdb';
import path from 'path';

import { apply as applyConfig } from '../../server/config';
// eslint-disable-next-line import/named
import { testing as serverTesting } from '../../server';

process.on('unhandledRejection', (reason, promise) => {
    promise.catch(err => {
        console.error('Reason: ', reason);
        console.error('Promise stack trace: ', err.stack || err);
    });
    throw new Error(`Unhandled promise rejection (promise stack trace is in the logs): ${reason}`);
});

before(async function() {
    // Set process.kresus.user for models.
    applyConfig({});

    // Set a temporary database for testing.
    let options = {
        dbName: '/tmp/kresus-test-db',
        modelsPath: path.join(__dirname, '..', '..', 'server', 'models', 'pouch')
    };
    options.db = new PouchDB(options.dbName, { auto_compaction: true });
    await serverTesting.configureCozyDB(options);

    // Initialize models.
    let initModels = require('../../server/models');
    await initModels();

    console.log('Database ready');
});
