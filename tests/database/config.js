/* eslint-disable no-console */

// There's a bug between eslint and prettier with spacing around async arrow
// functions, so we need to explicitly use async functions instead.
/* eslint-disable prefer-arrow-callback */

import * as fs from 'fs';
import * as path from 'path';

import { apply as applyConfig } from '../../server/config';
import { initModels } from '../../server/models';

process.on('unhandledRejection', (reason, promise) => {
    promise.catch(err => {
        console.error('Reason: ', reason);
        console.error('Promise stack trace: ', err.stack || err);
    });
    throw new Error(`Unhandled promise rejection (promise stack trace is in the logs): ${reason}`);
});

const TEST_DIR = '/tmp/kresus-tests';
const TEST_DB_PATH = path.join(TEST_DIR, 'test.sqlite');
const COZYDB_PATH = path.join(TEST_DIR, 'cozydb-data');

// Thanks stackoverflow!
const rmdir = function(dir) {
    let list = fs.readdirSync(dir);
    for (let i = 0; i < list.length; i++) {
        let filename = path.join(dir, list[i]);
        let stat = fs.statSync(filename);
        if (filename === '.' || filename === '..') {
            // pass these files
        } else if (stat.isDirectory()) {
            // rmdir recursively
            rmdir(filename);
        } else {
            // rm fiilename
            fs.unlinkSync(filename);
        }
    }
    fs.rmdirSync(dir);
};

export function applyTestConfig() {
    let dbLogs = typeof process.env.FORCE_DB_LOGS !== 'undefined' ? 'all' : 'error';
    applyConfig({
        db: {
            type: 'sqlite',
            sqlite_path: TEST_DB_PATH,
            log: dbLogs
        }
    });
}

before(async function() {
    // Remove previous test data.
    if (fs.existsSync(TEST_DIR)) {
        rmdir(TEST_DIR);
    }
    fs.mkdirSync(TEST_DIR);

    applyTestConfig();

    // Set a temporary Pouchdb database to fake a cozy-to-sql empty migration.
    let appOptions = {
        dbName: COZYDB_PATH
    };

    // Initialize models.
    await initModels(appOptions);

    console.log('********** Database ready');
});
