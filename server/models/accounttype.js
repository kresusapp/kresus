import * as cozydb from 'cozydb';
import { makeLogger, promisifyModel } from '../helpers';
import AccountTypes from '../shared/account-types.json';

let log = makeLogger('models/accounttype');

// ************************************************************************
// MODEL KEPT ONLY FOR BACKWARD COMPATIBILITY, DO NOT MODIFY.
// ************************************************************************

let AccountType = cozydb.getModel('accounttype', {
    // Display name
    name: String,

    // Weboob unique id
    weboobvalue: Number
});

AccountType = promisifyModel(AccountType);

// ************************************************************************
// SECTION STILL IN USE BY THE CODE BASE.
// ************************************************************************

// Maps external type id to name.
let typeToName = new Map();

for (let { weboobvalue: externalId, name } of AccountTypes) {
    typeToName.set(`${externalId}`, name);
}

// Sync function: returns the name associated to the id, or null if not found.
AccountType.idToName = function(externalId) {
    if (!externalId) {
        return null;
    }

    let externalIdStr = `${externalId}`;

    if (!typeToName.has(externalIdStr)) {
        log.error(`Error: ${externalIdStr} is undefined, please contact a kresus maintainer`);
        return null;
    }

    return typeToName.get(externalIdStr);
};

module.exports = AccountType;
