'use strict';

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

var _typeof2 = require('babel-runtime/helpers/typeof');

var _typeof3 = _interopRequireDefault(_typeof2);

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _context;

var _cozydb = require('cozydb');

var americano = _interopRequireWildcard(_cozydb);

var _helpers = require('../helpers');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var log = (0, _helpers.makeLogger)('models/bank');

var Bank = americano.getModel('bank', {
    // Display name
    name: String,
    // Weboob module id
    uuid: String,
    // TODO customFields shouldn't be saved in memory
    customFields: function customFields(x) {
        return x;
    }
});

Bank = (0, _helpers.promisifyModel)(Bank);

var request = (0, _helpers.promisify)((_context = Bank).request.bind(_context));

Bank.byUuid = function () {
    var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(uuid) {
        var params;
        return _regenerator2.default.wrap(function _callee$(_context2) {
            while (1) {
                switch (_context2.prev = _context2.next) {
                    case 0:
                        if (typeof uuid !== 'string') log.warn('Bank.byUuid misuse: uuid must be a String');

                        params = {
                            key: uuid
                        };
                        _context2.next = 4;
                        return request('byUuid', params);

                    case 4:
                        return _context2.abrupt('return', _context2.sent);

                    case 5:
                    case 'end':
                        return _context2.stop();
                }
            }
        }, _callee, this);
    }));

    function byUuid(_x) {
        return _ref.apply(this, arguments);
    }

    return byUuid;
}();

Bank.createOrUpdate = function () {
    var _ref2 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee2(bank) {
        var found, customFieldsAreDifferent;
        return _regenerator2.default.wrap(function _callee2$(_context3) {
            while (1) {
                switch (_context3.prev = _context3.next) {
                    case 0:

                        if ((typeof bank === 'undefined' ? 'undefined' : (0, _typeof3.default)(bank)) !== 'object' || typeof bank.uuid !== 'string') log.warn('Bank.createOrUpdate misuse: bank must be a Bank instance');

                        _context3.next = 3;
                        return Bank.byUuid(bank.uuid);

                    case 3:
                        found = _context3.sent;

                        if (!(!found || !found.length)) {
                            _context3.next = 9;
                            break;
                        }

                        log.info('Creating bank with uuid ' + bank.uuid + '...');
                        _context3.next = 8;
                        return Bank.create(bank);

                    case 8:
                        return _context3.abrupt('return', _context3.sent);

                    case 9:
                        if (!(found.length !== 1)) {
                            _context3.next = 11;
                            break;
                        }

                        throw new _helpers.KError('More than one bank with uuid ' + bank.uuid + '!');

                    case 11:

                        found = found[0];
                        // Will always update banks with customFields if the order of fields is
                        // changed
                        customFieldsAreDifferent = bank.customFields && (typeof found.customFields === 'undefined' || (0, _stringify2.default)(found.customFields) !== (0, _stringify2.default)(bank.customFields));

                        if (!(found.uuid !== bank.uuid || found.name !== bank.name || customFieldsAreDifferent)) {
                            _context3.next = 19;
                            break;
                        }

                        log.info('Updating attributes of bank with uuid ' + bank.uuid + '...');
                        _context3.next = 17;
                        return found.updateAttributes({
                            uuid: bank.uuid,
                            name: bank.name,
                            customFields: bank.customFields });

                    case 17:
                        _context3.next = 21;
                        break;

                    case 19:
                        log.info(found.name + ' information already up to date.');
                        return _context3.abrupt('return', found);

                    case 21:
                    case 'end':
                        return _context3.stop();
                }
            }
        }, _callee2, this);
    }));

    function createOrUpdate(_x2) {
        return _ref2.apply(this, arguments);
    }

    return createOrUpdate;
}();

module.exports = Bank;