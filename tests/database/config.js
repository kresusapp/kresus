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

// Thanks stackoverflow!
const rmdir = dir => {
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
            // rm filename
            fs.unlinkSync(filename);
        }
    }
    fs.rmdirSync(dir);
};

const SQLITE_DB_CONFIG = {
    type: 'sqlite',
    sqlite_path: TEST_DB_PATH,
};

// Assume a default database `postgres` for user `postgres` with password `test` running locally.
const POSTGRES_DB_CONFIG = {
    type: 'postgres',
    host: 'localhost',
    port: 5432,
    name: 'postgres',
    username: 'postgres',
    password: 'test',
};

export function applyTestConfig(usePostgres) {
    let dbLogs = typeof process.env.FORCE_DB_LOGS !== 'undefined' ? 'all' : 'error';

    let dbConfig = usePostgres ? POSTGRES_DB_CONFIG : SQLITE_DB_CONFIG;

    applyConfig({
        db: {
            logs: dbLogs,
            ...dbConfig,
        },
    });
}

before(async () => {
    const usePostgres = typeof process.env.USE_POSTGRES !== 'undefined';

    if (!usePostgres) {
        // Remove previous test data.
        if (fs.existsSync(TEST_DIR)) {
            rmdir(TEST_DIR);
        }
        fs.mkdirSync(TEST_DIR);
    }

    applyTestConfig(usePostgres);

    // Initialize models.
    await initModels();

    console.log('********** Database ready');
});
