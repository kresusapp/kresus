'use strict';

var _cozydb = require('cozydb');

var cozydb = _interopRequireWildcard(_cozydb);

var _helpers = require('../helpers');

var _operationTypes = require('../shared/operation-types.json');

var _operationTypes2 = _interopRequireDefault(_operationTypes);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

let log = (0, _helpers.makeLogger)('models/operationtype');

// ************************************************************************
// MODEL KEPT ONLY FOR BACKWARD COMPATIBILITY, DO NOT MODIFY.
// ************************************************************************

let OperationType = cozydb.getModel('operationtype', {
    // Display name
    name: String,

    // Weboob unique id
    weboobvalue: Number
});

OperationType = (0, _helpers.promisifyModel)(OperationType);

// ************************************************************************
// SECTION STILL IN USE BY THE CODE BASE.
// ************************************************************************

// Maps external type id to name.
let typeToName = new Map();

var _iteratorNormalCompletion = true;
var _didIteratorError = false;
var _iteratorError = undefined;

try {
    for (var _iterator = _operationTypes2.default[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        let _ref = _step.value;
        let externalId = _ref.weboobvalue,
            name = _ref.name;

        typeToName.set(`${externalId}`, name);
    }

    // Sync function: returns the name associated to the id, or null if not found.
} catch (err) {
    _didIteratorError = true;
    _iteratorError = err;
} finally {
    try {
        if (!_iteratorNormalCompletion && _iterator.return) {
            _iterator.return();
        }
    } finally {
        if (_didIteratorError) {
            throw _iteratorError;
        }
    }
}

OperationType.idToName = function (externalId) {
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

OperationType.isKnown = function (typeName) {
    return _operationTypes2.default.some(type => type.name === typeName);
};

module.exports = OperationType;