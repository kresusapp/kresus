let async = require('async');

let log = require('printit')({
    prefix: 'init',
    date: true
});

export default (app, server, callback) => {

    // Imports are within this scope, to ensure that americano-cozy is loaded
    // before we load any model

    let Bank              = require('./models/bank');
    let CozyInstance      = require('./models/cozyinstance');
    let OperationTypes    = require('./models/operationtype');

    let AllBanksData      = require('../../weboob/banks-all.json');
    let AllOperationTypes = require('../../weboob/operation-types.json');

    // Bank Operation type initialisation
    log.info("Maybe Adding operation types");
    async.each(AllOperationTypes, OperationTypes.checkAndCreate, (err) => {
        if (err) {
            log.error(`Error when adding operation: ${err}`);
            return;
        }
        log.info("Success: all operation types added.");
    });

    // Bank initialization
    log.info("Maybe Adding banks...");
    async.each(AllBanksData, Bank.createOrUpdate, (err) => {
        if (err) {
            log.error(`Error when adding / updating bank: ${err}`);
            return;
        }
        log.info("Success: All banks added.");
        if (callback)
            callback(app, server);
    });

    // Start bank polling
    log.info("Starting bank accounts polling...");
    require('./lib/accounts-poller').start();

    // Manage daily/weekly/monthly report
    log.info("Starting alert watcher...");
    require('./lib/report-manager').start();
}
