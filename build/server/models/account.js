'use strict';

var _cozydb = require('cozydb');

var cozydb = _interopRequireWildcard(_cozydb);

var _helpers = require('../helpers');

var _operation = require('./operation');

var _operation2 = _interopRequireDefault(_operation);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

let log = (0, _helpers.makeLogger)('models/account');

let Account = cozydb.getModel('bankaccount', {
    // ************************************************************************
    // EXTERNAL LINKS
    // ************************************************************************

    // External (backend) bank module identifier, determining which source to use.
    // TODO could be removed, since this is in the linked access?
    bank: String,

    // Id of the bankaccess instance.
    bankAccess: String,

    // Account number provided by the source. Acts as an id for other models.
    accountNumber: String,

    // ************************************************************************
    // ACCOUNT INFORMATION
    // ************************************************************************

    // Date at which the account has been imported.
    importDate: Date,

    // Amount on the account, at the date at which it has been imported.
    initialAmount: Number,

    // Date at which the account has been polled for the last time.
    lastChecked: Date,

    // Label describing the account provided by the source.
    title: String,

    // IBAN provided by the source (optional).
    iban: String,

    // Currency used by the account.
    currency: String,

    // If true, this account is not used to eval the balance of an access.
    excludeFromBalance: Boolean
});

Account = (0, _helpers.promisifyModel)(Account);

let request = (0, _helpers.promisify)(Account.request.bind(Account));

Account.byBank = (() => {
    var _ref = _asyncToGenerator(function* (bank) {
        if (typeof bank !== 'object' || typeof bank.uuid !== 'string') {
            log.warn('Account.byBank misuse: bank must be a Bank instance');
        }

        let params = {
            key: bank.uuid
        };
        return yield request('allByBank', params);
    });

    function byBank(_x) {
        return _ref.apply(this, arguments);
    }

    return byBank;
})();

Account.findMany = (() => {
    var _ref2 = _asyncToGenerator(function* (accountIds) {
        if (!(accountIds instanceof Array)) {
            log.warn('Account.findMany misuse: accountIds must be an Array');
        }
        if (accountIds.length && typeof accountIds[0] !== 'string') {
            log.warn('Account.findMany misuse: accountIds must be a [String]');
        }

        let params = {
            keys: accountIds.slice()
        };
        return yield request('allByAccountIds', params);
    });

    function findMany(_x2) {
        return _ref2.apply(this, arguments);
    }

    return findMany;
})();

Account.byAccess = (() => {
    var _ref3 = _asyncToGenerator(function* (access) {
        if (typeof access !== 'object' || typeof access.id !== 'string') {
            log.warn('Account.byAccess misuse: access must be an Access instance');
        }

        let params = {
            key: access.id
        };
        return yield request('allByBankAccess', params);
    });

    function byAccess(_x3) {
        return _ref3.apply(this, arguments);
    }

    return byAccess;
})();

Account.prototype.computeBalance = (() => {
    var _ref4 = _asyncToGenerator(function* () {
        let ops = yield _operation2.default.byAccount(this);
        let s = ops.reduce(function (sum, op) {
            return sum + op.amount;
        }, this.initialAmount);
        return Math.round(s * 100) / 100;
    });

    function computeBalance() {
        return _ref4.apply(this, arguments);
    }

    return computeBalance;
})();

module.exports = Account;