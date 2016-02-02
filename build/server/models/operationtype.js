'use strict';

var _getIterator2 = require('babel-runtime/core-js/get-iterator');

var _getIterator3 = _interopRequireDefault(_getIterator2);

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _map = require('babel-runtime/core-js/map');

var _map2 = _interopRequireDefault(_map);

var _context;

var _cozydb = require('cozydb');

var americano = _interopRequireWildcard(_cozydb);

var _helpers = require('../helpers');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var log = (0, _helpers.makeLogger)('models/operationtype');

var OperationType = americano.getModel('operationtype', {
    // Display name
    name: String,
    // Weboob unique id
    weboobvalue: Number
});

OperationType = (0, _helpers.promisifyModel)(OperationType);

// Maps weboob-ids to {name, internal-cozydb-id}
var MapOperationType = new _map2.default();

// Sync function
function recordOperationType(name, weboobId, id) {
    MapOperationType.set('' + weboobId, {
        name: name,
        id: id
    });
}

var request = (0, _helpers.promisify)((_context = OperationType).request.bind(_context));

OperationType.createOrUpdate = function () {
    var ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(operationtype) {
        var wValue, params, found, created;
        return _regenerator2.default.wrap(function _callee$(_context2) {
            while (1) {
                switch (_context2.prev = _context2.next) {
                    case 0:
                        wValue = operationtype.weboobvalue;
                        params = {
                            key: wValue
                        };
                        _context2.next = 4;
                        return request('byWeboobValue', params);

                    case 4:
                        found = _context2.sent;

                        if (!(found && found.length)) {
                            _context2.next = 14;
                            break;
                        }

                        recordOperationType(operationtype.name, found[0].weboobvalue, found[0].id);

                        if (!(found[0].name !== operationtype.name)) {
                            _context2.next = 12;
                            break;
                        }

                        _context2.next = 10;
                        return found[0].updateAttributes({ name: operationtype.name });

                    case 10:
                        log.info('Updated label of Operationtype with\n                      weboobvalue ' + wValue);
                        return _context2.abrupt('return');

                    case 12:
                        log.info('Operationtype with weboobvalue ' + wValue + ' already exists!');
                        return _context2.abrupt('return');

                    case 14:

                        log.info('Creating operationtype with weboobvalue ' + wValue + '...');
                        _context2.next = 17;
                        return OperationType.create(operationtype);

                    case 17:
                        created = _context2.sent;

                        log.info('Operation type has been created.');
                        recordOperationType(created.name, created.weboobvalue, created.id);

                    case 20:
                    case 'end':
                        return _context2.stop();
                }
            }
        }, _callee, this);
    }));
    return function createOrUpdate(_x) {
        return ref.apply(this, arguments);
    };
}();

// Sync function
OperationType.getOperationTypeID = function (weboobvalue) {
    if (!weboobvalue) return null;

    var weboobStr = '' + weboobvalue;

    if (!MapOperationType.has(weboobStr) === 'undefined') {
        log.error('Error: ' + weboobStr + ' is undefined,\n                   please contact a kresus maintainer');
        return null;
    }

    return MapOperationType.get(weboobStr).id;
};

// Sync function
OperationType.getUnknownTypeId = function () {
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
        for (var _iterator = (0, _getIterator3.default)(MapOperationType.values()), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var type = _step.value;

            if (type.name === 'type.unknown') return type.id;
        }
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

    log.error("Error: unknown type id isn't defined.");
    return null;
};

module.exports = OperationType;