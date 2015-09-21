let americano = require('../db').module;

let log = require('printit')({
    prefix: 'models/bank',
    date: true
});

let BankAccount = require('./account');

let Bank = americano.getModel('bank', {
    name: String,
    uuid: String,
    websites: function(x) { return x }
});


Bank.all = function(callback) {
    Bank.request("allByName", callback);
}


Bank.createOrUpdate = function(bank, callback) {

    let params = {
        key: bank.uuid
    };

    Bank.request("byUuid", params, (err, found) => {
        if (err)
            return callback(err);

        if (found && found.length) {
            if (found.length !== 1) {
                log.error(`More than one bank with uuid ${bank.uuid}!`);
                return callback('Duplicate bank');
            }

            found = found[0];

            if (found.uuid === bank.uuid && found.name === bank.name) {
                log.info(`${found.name} information already up to date.`);
                return callback();
            }

            log.info(`Updating attributes of bank with uuid ${bank.uuid}...`);
            found.updateAttributes({
                uuid: bank.uuid,
                name: bank.name
            }, callback);
            return;
        }

        log.info(`Creating bank with uuid ${bank.uuid}...`);
        Bank.create(bank, callback);
    });
}


Bank.getBanksWithAccounts = function(callback) {
    let params = {
        group: true
    };

    BankAccount.rawRequest('bankWithAccounts', params, (err, banks) => {

        if (err)
            return callback(err, null);

        if (!banks)
            return callback(null, []);

        let uuids = banks.map(bank => bank.key);
        Bank.getManyByUuid(uuids, (err, banks) => {
            callback(err, banks);
        });
    });
}


Bank.getManyByUuid = function(uuids, callback) {
    if (!(uuids instanceof Array))
        uuids = [uuids]
    let params = {
        keys: uuids
    };
    Bank.request("byUuid", params, callback);
}

export default Bank;
