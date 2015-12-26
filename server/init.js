import {makeLogger} from './helpers';

import * as Migrations from './models/migrations';
import * as Bank from './models/bank';
import * as OperationType from './models/operationtype';

import * as WeboobManager from './lib/sources/weboob';
import AccountPoller from './lib/accounts-poller';

import AllBanksData from '../../weboob/banks-all.json';
import AllOperationTypes from '../../weboob/operation-types.json';

let log = makeLogger('init');

// See comment in index.js.
module.exports = async (app, server, callback) => {
    try {
        // Do data migrations first
        log.info("Applying data migrations...");
        await Migrations.run();
        log.info("Done running data migrations.");

        // Bank Operation type initialisation
        log.info("Maybe adding operation types");
        for (let type of AllOperationTypes) {
            await OperationType.createOrUpdate(type);
        }
        log.info("Success: all operation types added.");

        // Bank initialization
        log.info("Maybe adding banks...");
        for (let bank of AllBanksData) {
            await Bank.createOrUpdate(bank);
        }
        log.info("Success: All banks added.");

        // Maybe install Weboob
        await WeboobManager.Init();

        // Start bank polling
        log.info("Starting bank accounts polling...");
        AccountPoller.start();
        await AccountPoller.runAtStartup();

        log.info("Server is ready, let's start the show!");

    } catch(err) {
        log.error(`Error at initialization: ${err}
        ${err.stack}`);
    }

    if (callback)
        callback(app, server);
}
