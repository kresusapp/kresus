'use strict';

var _getIterator2 = require('babel-runtime/core-js/get-iterator');

var _getIterator3 = _interopRequireDefault(_getIterator2);

var _map = require('babel-runtime/core-js/map');

var _map2 = _interopRequireDefault(_map);

var _cozydb = require('cozydb');

var americano = _interopRequireWildcard(_cozydb);

var _helpers = require('../helpers');

var _operationTypes = require('../shared/operation-types.json');

var _operationTypes2 = _interopRequireDefault(_operationTypes);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var log = (0, _helpers.makeLogger)('models/operationtype');

// ************************************************************************
// MODEL KEPT ONLY FOR BACKWARD COMPATIBILITY, DO NOT MODIFY.
// ************************************************************************

var OperationType = americano.getModel('operationtype', {
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
var typeToName = new _map2.default();

var _iteratorNormalCompletion = true;
var _didIteratorError = false;
var _iteratorError = undefined;

try {
    for (var _iterator = (0, _getIterator3.default)(_operationTypes2.default), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var _ref2 = _step.value;
        var externalId = _ref2.weboobvalue,
            name = _ref2.name;

        typeToName.set('' + externalId, name);
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

    var externalIdStr = '' + externalId;

    if (!typeToName.has(externalIdStr)) {
        log.error('Error: ' + externalIdStr + ' is undefined, please contact a kresus maintainer');
        return null;
    }

    return typeToName.get(externalIdStr);
};

OperationType.isKnown = function (typeName) {
    return _operationTypes2.default.some(function (type) {
        return type.name === typeName;
    });
};

module.exports = OperationType;