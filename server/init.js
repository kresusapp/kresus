let log = require('printit')({
    prefix: 'init',
    date: true
});

import {promisify} from './helpers';

export default async (app, server, callback) => {

    // Imports are within this scope, to ensure that americano-cozy is loaded
    // before we load any model. Can't use import here, as import statements
    // must be top-level.

    let Bank              = require('./models/bank');
    let CozyInstance      = require('./models/cozyinstance');
    let OperationTypes    = require('./models/operationtype');

    let AllBanksData      = require('../../weboob/banks-all.json');
    let AllOperationTypes = require('../../weboob/operation-types.json');
    let WeboobManager     = require('./lib/sources/weboob');

    let accountPoller     = require('./lib/accounts-poller');

    // Model helpers
    let mCreateOrUpdateOperationType = promisify(::OperationTypes.createOrUpdate);
    let mCreateOrUpdateBank = promisify(::Bank.createOrUpdate);
    let mInitWeboob = promisify(::WeboobManager.Init);
    let mRunAccountsPollerAtStartup = promisify(::accountPoller.runAtStartup);

    try {
        // Bank Operation type initialisation
        log.info("Maybe Adding operation types");
        for (let type of AllOperationTypes) {
            await mCreateOrUpdateOperationType(type);
        }
        log.info("Success: all operation types added.");

        // Bank initialization
        log.info("Maybe Adding banks...");
        for (let bank of AllBanksData) {
            await mCreateOrUpdateBank(bank);
        }
        log.info("Success: All banks added.");

        // Maybe install Weboob
        await mInitWeboob();

        // Start bank polling
        log.info("Starting bank accounts polling...");
        let accountPollers = require('./lib/accounts-poller');
        accountPollers.start();
        await mRunAccountsPollerAtStartup();

        // Manage daily/weekly/monthly report
        log.info("Starting alert watcher...");
        require('./lib/report-manager').start();

        log.info("Server is ready, let's start the show!");

    } catch(err) {
        log.error(`Error at initialization: ${err}`);
    }

    if (callback)
        callback(app, server);
}
