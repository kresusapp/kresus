import * as cozydb from 'cozydb';
import { makeLogger, promisifyModel } from '../helpers';
import OperationTypes from '../shared/operation-types.json';

let log = makeLogger('models/operationtype');

// ************************************************************************
// MODEL KEPT ONLY FOR BACKWARD COMPATIBILITY, DO NOT MODIFY.
// ************************************************************************

let OperationType = cozydb.getModel('operationtype', {
    // Display name
    name: String,

    // Weboob unique id
    weboobvalue: Number
});

OperationType = promisifyModel(OperationType);

// ************************************************************************
// SECTION STILL IN USE BY THE CODE BASE.
// ************************************************************************

// Maps external type id to name.
let typeToName = new Map();

for (let { weboobvalue: externalId, name } of OperationTypes) {
    typeToName.set(`${externalId}`, name);
}

// Sync function: returns the name associated to the id, or null if not found.
OperationType.idToName = function(externalId) {
    if (typeof externalId === 'undefined' || externalId === null) {
        return null;
    }

    let externalIdStr = `${externalId}`;

    if (!typeToName.has(externalIdStr)) {
        log.error(`Error: ${externalIdStr} is undefined, please contact a kresus maintainer`);
        return null;
    }

    return typeToName.get(externalIdStr);
};

OperationType.isKnown = function(typeName) {
    return OperationTypes.some(type => type.name === typeName);
};

module.exports = OperationType;
