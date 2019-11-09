import * as cozydb from 'cozydb';

import { assert, promisify, promisifyModel } from '../../helpers';

let Model = cozydb.getModel('access-field', {
    // The name of the field.
    name: String,

    // The value of the field.
    value: String,

    // The access internal string unique identifier of the access the field is attached to.
    accessId: String
});

const AccessFields = promisifyModel(Model);

let request = promisify(AccessFields.request.bind(AccessFields));

let olderCreate = AccessFields.create;
AccessFields.create = async function(userId, attributes) {
    assert(userId === 0, 'AccessFields.create first arg must be the userId.');
    let { accessId } = attributes;
    assert(
        typeof accessId === 'string' && accessId.length,
        'AccessFields.create second arg should have "accessId" String property'
    );

    return await olderCreate(attributes);
};

let olderFind = AccessFields.find;
AccessFields.find = async function(userId, fieldId) {
    assert(userId === 0, 'AccessFields.find first arg must be the userId.');
    return await olderFind(fieldId);
};

let olderAll = AccessFields.all;
AccessFields.all = async function(userId) {
    assert(userId === 0, 'AccessFields.all first arg must be the userId.');
    return await olderAll();
};

let olderExists = AccessFields.exists;
AccessFields.exists = async function(userId, fieldId) {
    assert(userId === 0, 'AccessFields.exists first arg must be the userId.');
    return await olderExists(fieldId);
};

let olderDestroy = AccessFields.destroy;
AccessFields.destroy = async function(userId, fieldId) {
    assert(userId === 0, 'AccessFields.destroy first arg must be the userId.');
    return await olderDestroy(fieldId);
};

let olderUpdateAttributes = AccessFields.updateAttributes;
AccessFields.update = async function(userId, fieldId, fields) {
    assert(userId === 0, 'AccessFields.update first arg must be the userId.');
    return await olderUpdateAttributes(fieldId, fields);
};

AccessFields.batchCreate = async function batchCreate(userId, accessId, fields) {
    assert(userId === 0, 'AccessFields.batchCreate first arg must be the userId.');
    assert(
        typeof accessId === 'string' && accessId.length,
        'AccessFields.batchCreate second arg should be a string "accessId"'
    );
    assert(fields instanceof Array, 'AccessFields.batchCreate third arg should be an array.');

    let fieldsFromDb = [];
    for (let field of fields) {
        fieldsFromDb.push(await AccessFields.create(userId, { ...field, accessId }));
    }
    return fieldsFromDb;
};

AccessFields.allByAccessId = async function allByAccessId(userId, accessId) {
    assert(userId === 0, 'AccessFields.allByAccessId first arg must be the userId.');
    assert(
        typeof accessId === 'string' && accessId.length,
        'AccessFields.allByAccessId second arg should be a string "accessId".'
    );
    return await request('allByAccessId', { key: accessId });
};

AccessFields.destroyByAccessId = async function destroyByAccessId(userId, accessId) {
    assert(userId === 0, 'AccessFields.destroyByAccessId first arg must be the userId.');
    assert(
        typeof accessId === 'string' && accessId.length,
        'AccessFields.destroyByAccessId second arg should be a string "accessId".'
    );

    let fields = await AccessFields.allByAccessId(userId, accessId);

    for (let field of fields) {
        await AccessFields.destroy(userId, field.id);
    }
};

AccessFields.updateOrCreateByAccessIdAndName = async function(userId, accessId, name, value) {
    assert(
        userId === 0,
        'AccessFields.updateOrCreateByAccessIdAndName first arg must be the userId.'
    );
    let field = await request('allByAccessIdAndName', { key: [accessId, name] });
    if (field instanceof Array && field.length) {
        assert(field.length === 1, 'more than one value set for a given custom field');
        field = field[0];
        if (value === null) {
            return await AccessFields.destroy(userId, field.id);
        }
        return await AccessFields.update(userId, field.id, { value });
    }
    if (value !== null) {
        return await AccessFields.create(userId, { name, value, accessId });
    }
};

AccessFields.batchUpdateOrCreate = async function batchUpdateOrCreate(
    userId,
    accessId,
    fields = []
) {
    assert(userId === 0, 'AccessFields.batchUpdateOrCreate first arg must be the userId.');
    assert(fields instanceof Array, 'AccessFields.batchUpdateOrCreate third arg must be an array.');
    for (let field of fields) {
        await AccessFields.updateOrCreateByAccessIdAndName(
            userId,
            accessId,
            field.name,
            field.value
        );
    }
};

AccessFields.updateAttributes = function updateAttributes() {
    assert(false, 'AccessFields.updateAttributes is deprecated. Please use AccessFields.update');
};

module.exports = AccessFields;
