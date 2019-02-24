import * as cozydb from 'cozydb';

import { assert, makeLogger, promisify, promisifyModel } from '../helpers';

let log = makeLogger('models/accesses');

let Access = cozydb.getModel('bankaccess', {
    // External (backend) unique identifier.
    bank: String,

    // Credentials to connect to the bank's website.
    login: String,
    password: { type: String, default: null },

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

    // Text label set by the user.
    customLabel: {
        type: String,
        default: null
    },

    // ************************************************************************
    // DEPRECATED.
    // ************************************************************************
    website: String
});

Access = promisifyModel(Access);

let request = promisify(Access.request.bind(Access));

let olderCreate = Access.create;
Access.create = async function(userId, attributes) {
    assert(userId === 0, 'Access.create first arg must be the userId.');
    return await olderCreate(attributes);
};

let olderFind = Access.find;
Access.find = async function(userId, accessId) {
    assert(userId === 0, 'Access.find first arg must be the userId.');
    return await olderFind(accessId);
};

let olderAll = Access.all;
Access.all = async function(userId) {
    assert(userId === 0, 'Access.all first arg must be the userId.');
    return await olderAll();
};

let olderExists = Access.exists;
Access.exists = async function(userId, accessId) {
    assert(userId === 0, 'Access.exists first arg must be the userId.');
    return await olderExists(accessId);
};

let olderDestroy = Access.destroy;
Access.destroy = async function(userId, accessId) {
    assert(userId === 0, 'Access.destroy first arg must be the userId.');
    return await olderDestroy(accessId);
};

let olderUpdateAttributes = Access.updateAttributes;
Access.update = async function(userId, accessId, fields) {
    assert(userId === 0, 'Access.update first arg must be the userId.');
    return await olderUpdateAttributes(accessId, fields);
};

Access.updateAttributes = function() {
    assert(false, 'Access.updateAttributes is deprecated. Please use Access.update');
};

Access.byBank = async function byBank(userId, bank) {
    assert(userId === 0, 'Access.byBank first arg must be the userId.');
    if (typeof bank !== 'object' || typeof bank.uuid !== 'string') {
        log.warn('Access.byBank misuse: bank must be a Bank instance.');
    }

    let params = {
        key: bank.uuid
    };
    return await request('allByBank', params);
};

// Sync function
Access.prototype.hasPassword = function() {
    return typeof this.password === 'string' && this.password.length > 0;
};

// Can the access be polled
Access.prototype.canBePolled = function() {
    return (
        this.enabled &&
        this.fetchStatus !== 'INVALID_PASSWORD' &&
        this.fetchStatus !== 'EXPIRED_PASSWORD' &&
        this.fetchStatus !== 'INVALID_PARAMETERS' &&
        this.fetchStatus !== 'NO_PASSWORD' &&
        this.fetchStatus !== 'ACTION_NEEDED' &&
        this.fetchStatus !== 'AUTH_METHOD_NYI'
    );
};

module.exports = Access;
