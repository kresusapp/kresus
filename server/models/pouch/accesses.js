import * as cozydb from 'cozydb';

import AccessFields from './access-fields';

import { assert, makeLogger, promisify, promisifyModel, FETCH_STATUS_SUCCESS } from '../../helpers';

let log = makeLogger('models/accesses');

let Access = cozydb.getModel('bankaccess', {
    // External (backend) unique identifier.
    vendorId: String,

    // Credentials to connect to the bank's website.
    login: String,
    password: { type: String, default: null },

    // Text status indicating whether the last poll was successful or not.
    fetchStatus: {
        type: String,
        default: FETCH_STATUS_SUCCESS
    },

    // Text label set by the user.
    customLabel: {
        type: String,
        default: null
    },

    // ************************************************************************
    // DEPRECATED.
    // ************************************************************************
    website: String,
    enabled: Boolean,

    // External (backend) unique identifier. Renamed to vendorId.
    bank: String,

    // Any supplementary fields necessary to connect to the bank's website.
    // Moved to their own data structure.
    customFields: {
        type: String,
        default: null
    }
});

Access = promisifyModel(Access);

Access.renamings = {
    bank: 'vendorId'
};

let request = promisify(Access.request.bind(Access));

async function attachFields(userId, access) {
    access.fields = await AccessFields.allByAccessId(userId, access.id);
    return access;
}

let olderCreate = Access.create;
Access.create = async function(userId, { fields = null, ...other }) {
    assert(userId === 0, 'Access.create first arg must be the userId.');

    let access = await olderCreate(other);

    if (fields !== null) {
        await AccessFields.batchCreate(userId, access.id, fields);
    }

    return await attachFields(userId, access);
};

let olderFind = Access.find;
Access.find = async function(userId, accessId) {
    assert(userId === 0, 'Access.find first arg must be the userId.');
    let access = await olderFind(accessId);
    return await attachFields(userId, access);
};

let olderAll = Access.all;
Access.all = async function(userId) {
    assert(userId === 0, 'Access.all first arg must be the userId.');
    let accesses = await olderAll();
    for (let access of accesses) {
        await attachFields(userId, access);
    }
    return accesses;
};

let olderExists = Access.exists;
Access.exists = async function(userId, accessId) {
    assert(userId === 0, 'Access.exists first arg must be the userId.');
    return await olderExists(accessId);
};

let olderDestroy = Access.destroy;
Access.destroy = async function(userId, accessId) {
    assert(userId === 0, 'Access.destroy first arg must be the userId.');
    await AccessFields.destroyByAccessId(userId, accessId);
    return await olderDestroy(accessId);
};

let olderUpdateAttributes = Access.updateAttributes;
Access.update = async function(userId, accessId, { fields = [], ...other }) {
    assert(userId === 0, 'Access.update first arg must be the userId.');
    await AccessFields.batchUpdateOrCreate(userId, accessId, fields);
    let updatedAccess = await olderUpdateAttributes(accessId, other);
    return await attachFields(userId, updatedAccess);
};

Access.updateAttributes = function() {
    assert(false, 'Access.updateAttributes is deprecated. Please use Access.update');
};

Access.byVendorId = async function byVendorId(userId, bank) {
    assert(userId === 0, 'Access.byVendorId first arg must be the userId.');
    if (typeof bank !== 'object' || typeof bank.uuid !== 'string') {
        log.warn('Access.byVendorId misuse: bank must be a Bank instance.');
    }

    let params = {
        key: bank.uuid
    };

    let accesses = await request('allByVendorId', params);

    for (let access of accesses) {
        await attachFields(userId, access);
    }

    return accesses;
};

// Sync function
Access.prototype.hasPassword = function() {
    return typeof this.password === 'string' && this.password.length > 0;
};

// Is the access enabled
Access.prototype.isEnabled = function() {
    return this.password !== null;
};

// Can the access be polled
Access.prototype.canBePolled = function() {
    return (
        this.isEnabled() &&
        this.fetchStatus !== 'INVALID_PASSWORD' &&
        this.fetchStatus !== 'EXPIRED_PASSWORD' &&
        this.fetchStatus !== 'INVALID_PARAMETERS' &&
        this.fetchStatus !== 'NO_PASSWORD' &&
        this.fetchStatus !== 'ACTION_NEEDED' &&
        this.fetchStatus !== 'AUTH_METHOD_NYI'
    );
};

module.exports = Access;
