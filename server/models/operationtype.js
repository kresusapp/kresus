import * as americano from 'cozydb';
import { makeLogger, promisifyModel } from '../helpers';
import OperationTypes from '../shared/operation-types.json';


let log = makeLogger('models/operationtype');

// Kept for migration purpose (m7)
let OperationType = americano.getModel('operationtype', {
    // Display name
    name: String,

    // Weboob unique id
    weboobvalue: Number
});

OperationType = promisifyModel(OperationType);

// Maps weboob-ids to {name, internal-cozydb-id}
let MapOperationType = new Map;

for (let { weboobvalue, name } of OperationTypes) {
    MapOperationType.set(`${weboobvalue}`, name);
}

// Sync function
OperationType.getNameFromWeboobId = function(weboobvalue) {
    if (!weboobvalue)
        return null;

    let weboobStr = `${weboobvalue}`;

    if (!MapOperationType.has(weboobStr)) {
        log.error(`Error: ${weboobStr} is undefined,
                   please contact a kresus maintainer`);
        return null;
    }

    return MapOperationType.get(weboobStr);
};

OperationType.isKnown = function(typeName) {
    return OperationTypes.some(type => type.name === typeName);
};

module.exports = OperationType;
