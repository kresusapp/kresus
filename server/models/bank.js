import * as cozydb from 'cozydb';
import { makeLogger, promisifyModel } from '../helpers';

import StaticBanks from '../shared/banks.json';

let log = makeLogger('models/bank');

let Bank = cozydb.getModel('bank', {
    // Display name
    name: String,
    // Weboob module id
    uuid: String,
    // TODO customFields shouldn't be saved in memory
    customFields: x => x
});

Bank = promisifyModel(Bank);

Bank.byUuid = function byUuid(uuid) {
    if (typeof uuid !== 'string') {
        log.warn('Bank.byUuid misuse: uuid must be a String');
    }

    return StaticBanks.find(bank => bank.uuid === uuid);
};

module.exports = Bank;
