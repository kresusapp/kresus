let log = require('printit')({
    prefix: 'models/access',
    date: true
});

import * as americano from 'cozydb';
import {promisify, promisifyModel} from '../helpers';

let Access = americano.getModel('bankaccess', {
    bank: String,
    login: String,
    password: String,
    website: String
});

Access = promisifyModel(Access);

let request = promisify(::Access.request);

Access.allFromBank = async function allFromBank(bank) {
    if (typeof bank !== 'object' || typeof bank.uuid !== 'string')
        log.warn("Access.allFromBank API misuse: bank is probably not an Bank object");

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
    return await Access.request("allLike", params);
}

// Sync function
Access.prototype.hasPassword = function() {
    return typeof this.password !== 'undefined' &&
           typeof this._passwordStillEncrypted === 'undefined';
}

export default Access;

