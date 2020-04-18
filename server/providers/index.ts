import fs from 'fs';

import { Access } from '../models';
import { assert, KError } from '../helpers';

import ALL_BANKS from '../shared/banks.json';

const BANK_HANDLERS = new Map();

function init() {
    const SOURCE_HANDLERS = {};

    function addBackend(handler) {
        if (
            typeof handler.SOURCE_NAME === 'undefined' ||
            typeof handler.fetchAccounts === 'undefined' ||
            typeof handler.fetchOperations === 'undefined'
        ) {
            throw new KError("Backend doesn't implement basic functionality.");
        }
        SOURCE_HANDLERS[handler.SOURCE_NAME] = handler;
    }

    // Go through all the files in this directory, and try to import them as
    // bank handlers.
    for (const fileOrDirName of fs.readdirSync(__dirname)) {
        if (fileOrDirName === 'index.js' || fileOrDirName === 'index.ts') {
            // Skip this file :)
            continue;
        }

        // eslint-disable-next-line import/no-dynamic-require, @typescript-eslint/no-var-requires
        const handler = require(`./${fileOrDirName}`);

        addBackend(handler);
    }

    // Connect static bank information to their backends.
    for (const bank of ALL_BANKS) {
        if (!bank.backend || !(bank.backend in SOURCE_HANDLERS)) {
            throw new KError('Bank handler not described or not imported.');
        }
        assert(!BANK_HANDLERS.has(bank.uuid), 'duplicate bank uuid');
        BANK_HANDLERS.set(bank.uuid, SOURCE_HANDLERS[bank.backend]);
    }
}

export function getProvider(access: Access) {
    return BANK_HANDLERS.get(access.vendorId);
}

init();
