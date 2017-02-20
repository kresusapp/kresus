'use strict';

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _typeof2 = require('babel-runtime/helpers/typeof');

var _typeof3 = _interopRequireDefault(_typeof2);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _context;

var _cozydb = require('cozydb');

var americano = _interopRequireWildcard(_cozydb);

var _helpers = require('../helpers');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var log = (0, _helpers.makeLogger)('models/access');

var Access = americano.getModel('bankaccess', {
    // External (backend) unique identifier.
    bank: String,

    // Credentials to connect to the bank's website.
    login: String,
    password: String,

    // Any supplementary fields necessary to connect to the bank's website.
    customFields: String,

    // Text status indicating whether the last poll was successful or not.
    fetchStatus: {
        type: String,
        default: 'OK'
    },

    // ************************************************************************
    // DEPRECATED.
    // ************************************************************************
    website: String,
    _passwordStillEncrypted: Boolean
});

Access = (0, _helpers.promisifyModel)(Access);

var request = (0, _helpers.promisify)((_context = Access).request.bind(_context));

Access.byBank = function () {
    var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(bank) {
        var params;
        return _regenerator2.default.wrap(function _callee$(_context2) {
            while (1) {
                switch (_context2.prev = _context2.next) {
                    case 0:
                        if ((typeof bank === 'undefined' ? 'undefined' : (0, _typeof3.default)(bank)) !== 'object' || typeof bank.uuid !== 'string') {
                            log.warn('Access.byBank misuse: bank must be a Bank instance.');
                        }

                        params = {
                            key: bank.uuid
                        };
                        _context2.next = 4;
                        return request('allByBank', params);

                    case 4:
                        return _context2.abrupt('return', _context2.sent);

                    case 5:
                    case 'end':
                        return _context2.stop();
                }
            }
        }, _callee, this);
    }));

    function byBank(_x) {
        return _ref.apply(this, arguments);
    }

    return byBank;
}();

Access.allLike = function () {
    var _ref2 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee2(access) {
        var params;
        return _regenerator2.default.wrap(function _callee2$(_context3) {
            while (1) {
                switch (_context3.prev = _context3.next) {
                    case 0:
                        if ((typeof access === 'undefined' ? 'undefined' : (0, _typeof3.default)(access)) !== 'object' || typeof access.bank !== 'string' || typeof access.login !== 'string' || typeof access.password !== 'string') {
                            log.warn('Access.allLike misuse: access must be an Access instance.');
                        }

                        params = {
                            key: [access.bank, access.login, access.password]
                        };
                        _context3.next = 4;
                        return request('allLike', params);

                    case 4:
                        return _context3.abrupt('return', _context3.sent);

                    case 5:
                    case 'end':
                        return _context3.stop();
                }
            }
        }, _callee2, this);
    }));

    function allLike(_x2) {
        return _ref2.apply(this, arguments);
    }

    return allLike;
}();

// Sync function
Access.prototype.hasPassword = function () {
    return (typeof this._passwordStillEncrypted === 'undefined' || !this._passwordStillEncrypted) && typeof this.password !== 'undefined';
};

// Can the access be polled
Access.prototype.canBePolled = function () {
    return this.fetchStatus !== 'INVALID_PASSWORD' && this.fetchStatus !== 'EXPIRED_PASSWORD' && this.fetchStatus !== 'INVALID_PARAMETERS' && this.fetchStatus !== 'NO_PASSWORD';
};

module.exports = Access;