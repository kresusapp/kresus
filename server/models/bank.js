import * as americano from 'cozydb';
import { makeLogger, promisify, promisifyModel } from '../helpers';

let log = makeLogger('models/bank');

let Bank = americano.getModel('bank', {
    // Display name
    name: String,
    // Weboob module id
    uuid: String,
    // TODO customFields shouldn't be saved in memory
    customFields: x => x
});

Bank = promisifyModel(Bank);

let request = promisify(::Bank.request);

Bank.createOrUpdate = async function createOrUpdate(bank) {

    if (typeof bank !== 'object' || typeof bank.uuid !== 'string')
        log.warn('Bank.createOrUpdate misuse: bank must be a Bank instance');

    let params = {
        key: bank.uuid
    };

    let found = await request('byUuid', params);
    if (!found || !found.length) {
        log.info(`Creating bank with uuid ${bank.uuid}...`);
        return await Bank.create(bank);
    }

    if (found.length !== 1) {
        throw `More than one bank with uuid ${bank.uuid}!`;
    }

    found = found[0];
    // TODO this is a rough approximate, but Bank information ought not to be
    // saved in memory anyways.
    if (found.uuid === bank.uuid && found.name === bank.name &&
        typeof found.customFields === typeof bank.customFields) {
        log.info(`${found.name} information already up to date.`);
        return found;
    }

    log.info(`Updating attributes of bank with uuid ${bank.uuid}...`);
    await found.updateAttributes({
        uuid: bank.uuid,
        name: bank.name,
        customFields: bank.customFields
    });
};

module.exports = Bank;
