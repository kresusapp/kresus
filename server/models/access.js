import * as cozydb from 'cozydb';

import { makeLogger, promisify, promisifyModel } from '../helpers';

let log = makeLogger('models/access');

let Access = cozydb.getModel('bankaccess', {
    // External (backend) unique identifier.
    bank: String,

    // Credentials to connect to the bank's website.
    login: String,
    password: String,

    // Any supplementary fields necessary to connect to the bank's website.
    customFields: {
        type: String,
        default: '[]'
    },

    // Text status indicating whether the last poll was successful or not.
    fetchStatus: {
        type: String,
        default: 'OK'
    },

    // Boolean indicating if the access is enabled or not.
    enabled: {
        type: Boolean,
        default: true
    },

    // ************************************************************************
    // DEPRECATED.
    // ************************************************************************
    website: String,
    _passwordStillEncrypted: Boolean
});

Access = promisifyModel(Access);

let request = promisify(Access.request.bind(Access));

Access.byBank = async function byBank(bank) {
    if (typeof bank !== 'object' || typeof bank.uuid !== 'string') {
        log.warn('Access.byBank misuse: bank must be a Bank instance.');
    }

    let params = {
        key: bank.uuid
    };
    return await request('allByBank', params);
};

Access.allLike = async function allLike(access) {
    if (
        typeof access !== 'object' ||
        typeof access.bank !== 'string' ||
        typeof access.login !== 'string' ||
        typeof access.password !== 'string'
    ) {
        log.warn('Access.allLike misuse: access must be an Access instance.');
    }

    let params = {
        key: [access.bank, access.login, access.password]
    };
    return await request('allLike', params);
};

// Sync function
Access.prototype.hasPassword = function() {
    return typeof this.password == 'string' && this.password.length >0;
};

// Can the access be polled
Access.prototype.canBePolled = function() {
    return (
        this.enabled &&
        this.fetchStatus !== 'INVALID_PASSWORD' &&
        this.fetchStatus !== 'EXPIRED_PASSWORD' &&
        this.fetchStatus !== 'INVALID_PARAMETERS' &&
        this.fetchStatus !== 'NO_PASSWORD' &&
        this.fetchStatus !== 'ACTION_NEEDED'
    );
};

module.exports = Access;
