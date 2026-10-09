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

// Only use the local fake modules in tests, to never hit the remote Woob repository.
const TEST_WOOB_SOURCES_LIST = path.join(TEST_DIR, 'woob-sources.list');
const TEST_WOOB_SOURCES_LIST_CONTENT = `file://${path.join(TEST_DIR, 'fakemodules')}\n`;

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

export function applyTestConfig() {
    let dbLogs = typeof process.env.FORCE_DB_LOGS !== 'undefined' ? 'all' : 'error';
    applyConfig({
        kresus: {
            datadir: TEST_DIR,
        },
        woob: {
            sources_list: TEST_WOOB_SOURCES_LIST,
        },
        db: {
            type: 'sqlite',
            sqlite_path: TEST_DB_PATH,
            log: dbLogs,
        },
    });
}

before(async () => {
    // Remove previous test data.
    if (fs.existsSync(TEST_DIR)) {
        rmdir(TEST_DIR);
    }
    fs.mkdirSync(TEST_DIR);
    fs.writeFileSync(TEST_WOOB_SOURCES_LIST, TEST_WOOB_SOURCES_LIST_CONTENT);

    applyTestConfig();

    // Initialize models.
    await initModels();

    console.log('********** Database ready');
});
