'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.resyncBalance = exports.getOperations = exports.destroy = exports.update = exports.destroyWithOperations = exports.preloadAccount = undefined;

// Prefills the @account field with a queried bank account.
let preloadAccount = exports.preloadAccount = (() => {
    var _ref = _asyncToGenerator(function* (req, res, next, accountID) {
        try {
            let account = yield _account2.default.find(accountID);
            if (!account) {
                throw new _helpers.KError('Bank account not found', 404);
            }
            req.preloaded = { account };
            return next();
        } catch (err) {
            return (0, _helpers.asyncErr)(res, err, 'when preloading a bank account');
        }
    });

    return function preloadAccount(_x, _x2, _x3, _x4) {
        return _ref.apply(this, arguments);
    };
})();

// Destroy an account and all its operations, alerts, and accesses if no other
// accounts are bound to this access.


let destroyWithOperations = exports.destroyWithOperations = (() => {
    var _ref2 = _asyncToGenerator(function* (account) {
        log.info(`Removing account ${account.title} from database...`);

        log.info(`\t-> Destroy operations for account ${account.title}`);
        yield _operation2.default.destroyByAccount(account.id);

        log.info(`\t-> Destroy alerts for account ${account.title}`);
        yield _alert2.default.destroyByAccount(account.id);

        log.info(`\t-> Checking if ${account.title} is the default account`);
        let found = yield _config2.default.findOrCreateDefault('defaultAccountId');
        if (found && found.value === account.id) {
            log.info('\t\t-> Removing the default account');
            found.value = '';
            yield found.save();
        }

        log.info(`\t-> Destroy account ${account.title}`);
        yield account.destroy();

        let accounts = yield _account2.default.byAccess({ id: account.bankAccess });
        if (accounts && accounts.length === 0) {
            log.info('\t-> No other accounts bound: destroying access.');
            yield _access2.default.destroy(account.bankAccess);
        }
    });

    return function destroyWithOperations(_x5) {
        return _ref2.apply(this, arguments);
    };
})();

// Update an account.


let update = exports.update = (() => {
    var _ref3 = _asyncToGenerator(function* (req, res) {
        try {
            let attr = req.body;

            // We can only update the flag excludeFromBalance
            // of an account.
            if (typeof attr.excludeFromBalance === 'undefined') {
                throw new _helpers.KError('Missing parameter', 400);
            }

            let account = req.preloaded.account;
            let newAccount = yield account.updateAttributes(attr);
            res.status(200).json(newAccount);
        } catch (err) {
            return (0, _helpers.asyncErr)(res, err, 'when updating an account');
        }
    });

    return function update(_x6, _x7) {
        return _ref3.apply(this, arguments);
    };
})();

// Delete account, operations and alerts.


let destroy = exports.destroy = (() => {
    var _ref4 = _asyncToGenerator(function* (req, res) {
        try {
            yield destroyWithOperations(req.preloaded.account);
            res.status(204).end();
        } catch (err) {
            return (0, _helpers.asyncErr)(res, err, 'when destroying an account');
        }
    });

    return function destroy(_x8, _x9) {
        return _ref4.apply(this, arguments);
    };
})();

// Get operations of a given bank account


let getOperations = exports.getOperations = (() => {
    var _ref5 = _asyncToGenerator(function* (req, res) {
        try {
            let account = req.preloaded.account;
            let operations = yield _operation2.default.byBankSortedByDate(account);
            res.status(200).json(operations);
        } catch (err) {
            return (0, _helpers.asyncErr)(res, err, 'when getting operations for a bank account');
        }
    });

    return function getOperations(_x10, _x11) {
        return _ref5.apply(this, arguments);
    };
})();

let resyncBalance = exports.resyncBalance = (() => {
    var _ref6 = _asyncToGenerator(function* (req, res) {
        try {
            let account = req.preloaded.account;
            let updatedAccount = yield _accountsManager2.default.resyncAccountBalance(account);
            res.status(200).json(updatedAccount);
        } catch (err) {
            return (0, _helpers.asyncErr)(res, err, 'when getting balance of a bank account');
        }
    });

    return function resyncBalance(_x12, _x13) {
        return _ref6.apply(this, arguments);
    };
})();

var _account = require('../../models/account');

var _account2 = _interopRequireDefault(_account);

var _operation = require('../../models/operation');

var _operation2 = _interopRequireDefault(_operation);

var _access = require('../../models/access');

var _access2 = _interopRequireDefault(_access);

var _alert = require('../../models/alert');

var _alert2 = _interopRequireDefault(_alert);

var _config = require('../../models/config');

var _config2 = _interopRequireDefault(_config);

var _accountsManager = require('../../lib/accounts-manager');

var _accountsManager2 = _interopRequireDefault(_accountsManager);

var _helpers = require('../../helpers');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

let log = (0, _helpers.makeLogger)('controllers/accounts');