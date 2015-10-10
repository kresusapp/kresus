let log = require('printit')({
    prefix: 'models/bank',
    date: true
});

import {module as americano} from '../db';
import {promisify, promisifyModel} from '../helpers';

import Account from './account';

let Bank = americano.getModel('bank', {
    name: String,
    uuid: String,
    // TODO websites shouldn't be saved in memory
    websites: function(x) { return x }
});

Bank = promisifyModel(Bank);

let request = promisify(::Bank.request);

Bank.createOrUpdate = async function createOrUpdate(bank) {

    if (typeof bank !== 'object' || typeof bank.uuid !== 'string')
        log.warn("Bank.createOrUpdate API misuse: bank is probably not an instance of Bank");

    let params = {
        key: bank.uuid
    };

    let found = await request("byUuid", params);
    if (!found || !found.length) {
        log.info(`Creating bank with uuid ${bank.uuid}...`);
        return await Bank.create(bank);
    }

    if (found.length !== 1) {
        throw `More than one bank with uuid ${bank.uuid}!`;
    }

    found = found[0];
    if (found.uuid === bank.uuid && found.name === bank.name) {
        log.info(`${found.name} information already up to date.`);
        return found;
    }

    log.info(`Updating attributes of bank with uuid ${bank.uuid}...`);
    await found.updateAttributes({
        uuid: bank.uuid,
        name: bank.name
    });
}

let AccountRawRequest = promisify(::Bank.rawRequest);

Bank.getBanksWithAccounts = async function getBanksWithAccounts() {
    let params = {
        group: true
    };

    let banks = await AccountRawRequest('bankWithAccounts', params);
    if (!banks)
        return [];

    let uuids = banks.map(bank => bank.key);
    params = {
        keys: uuids
    };
    return await request("byUuid", params);
}

export default Bank;
