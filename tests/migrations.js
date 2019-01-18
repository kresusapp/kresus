/* eslint-disable no-console */

// There's a bug between eslint and prettier with spacing around async arrow
// functions, so we need to explicitly use async functions instead.
/* eslint-disable prefer-arrow-callback */

import PouchDB from 'pouchdb';

import { apply as applyConfig } from '../server/config';
// eslint-disable-next-line import/named
import { testing as serverTesting } from '../server';

process.on('unhandledRejection', (reason, promise) => {
    promise.catch(err => {
        console.error('Reason: ', reason);
        console.error('Promise stack trace: ', err.stack || err);
    });
    throw new Error(`Unhandled promise rejection (promise stack trace is in the logs): ${reason}`);
});

let Config = null;

before(async function() {
    // Set process.kresus.user for models.
    applyConfig();

    // Set a temporary database for testing.
    let options = {
        dbName: '/tmp/kresus-test-db'
    };
    options.db = new PouchDB(options.dbName, { auto_compaction: true });
    await serverTesting.configureCozyDB(options);

    // Initialize models.
    let initModels = require('../server/models');
    await initModels();

    Config = require('../server/models/config');
});

async function clear(Model) {
    let all = await Model.all(0);
    for (let i of all) {
        if (typeof i.id !== 'undefined') {
            await Model.destroy(0, i.id);
        }
    }
}

describe('Test migration 0', () => {
    it('should insert new config in the DB', async function() {
        await clear(Config);

        await Config.create(0, {
            name: 'weboob-log',
            value: 'Some value'
        });

        await Config.create(0, {
            name: 'another-setting',
            value: 'Another value'
        });

        let allConfigs = await Config.allWithoutGhost(0);

        allConfigs.length.should.equal(3);

        allConfigs.should.containDeep([
            {
                name: 'locale'
            },
            {
                name: 'another-setting',
                value: 'Another value'
            },
            {
                name: 'weboob-log',
                value: 'Some value'
            }
        ]);
    });

    it('should run migration 0 correctly', async function() {
        let { migrations } = require('../server/models/migrations').testing;
        let m0 = migrations[0];

        let cache = {};
        let result = await m0(cache, 0);
        result.should.equal(true);
    });

    it('should have removed the weboob-log key', async function() {
        let allConfigs = await Config.allWithoutGhost(0);

        allConfigs.length.should.equal(2);

        allConfigs.should.not.containDeep([
            {
                name: 'weboob-log',
                value: 'Some value'
            }
        ]);

        allConfigs.should.containDeep([
            {
                name: 'locale'
            },
            {
                name: 'another-setting',
                value: 'Another value'
            }
        ]);
    });
});
