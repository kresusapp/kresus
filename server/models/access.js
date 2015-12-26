import * as americano from 'cozydb';
import {makeLogger, promisify, promisifyModel} from '../helpers';

let log = makeLogger('models/access');

let Access = americano.getModel('bankaccess', {
    bank: String,
    login: String,
    password: String,
    customFields: String,

    // Don't use! Only used to migrate data
    website: String
});

Access = promisifyModel(Access);

let request = promisify(::Access.request);

Access.byBank = async function byBank(bank) {
    if (typeof bank !== 'object' || typeof bank.uuid !== 'string')
        log.warn("Access.byBank API misuse: bank is probably not an Bank object");

    let params = {
        key: bank.uuid
    };
    return await request("allByBank", params);
};

Access.allLike = async function allLike(access) {
    if (typeof access !== 'object' ||
        typeof access.bank !== 'string' ||
        typeof access.login !== 'string' ||
        typeof access.password !== 'string')
    {
        log.warn("Access.allLike API misuse: access is probably not an Access object");
    }

    let params = {
        key: [access.bank, access.login, access.password]
    };
    return await request("allLike", params);
}

// Sync function
Access.prototype.hasPassword = function() {
    return typeof this.password !== 'undefined' &&
           typeof this._passwordStillEncrypted === 'undefined';
}

module.exports = Access;
