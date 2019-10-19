import * as cozydb from 'cozydb';
import { promisifyModel } from '../../helpers';

let Bank = cozydb.getModel('bank', {
    // Display name
    name: String,
    // Weboob module id
    uuid: String,
    // TODO customFields shouldn't be saved in memory
    customFields: x => x
});

Bank = promisifyModel(Bank);

module.exports = Bank;
