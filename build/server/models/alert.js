'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _cozydb = require('cozydb');

var cozydb = _interopRequireWildcard(_cozydb);

var _helpers = require('../helpers');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

let log = (0, _helpers.makeLogger)('models/alert');

let Alert = cozydb.getModel('bankalert', {
    // internal account id.
    accountId: String,

    // possible options are: report, balance, transaction.
    type: String,

    // only for reports : daily, weekly, monthly.
    frequency: String,

    // only for balance/transaction.
    limit: Number,

    // only for balance/transaction: gt, lt.
    order: String,

    // when did the alert get triggered for the last time?
    lastTriggeredDate: Date,

    // ///////////////////////////////////////////////////
    // // DEPRECATED
    // //////////////////////////////////////////////////

    // external (backend) account id.
    bankAccount: String
});

Alert = (0, _helpers.promisifyModel)(Alert);

let request = (0, _helpers.promisify)(Alert.request.bind(Alert));
let requestDestroy = (0, _helpers.promisify)(Alert.requestDestroy.bind(Alert));

Alert.byAccount = (() => {
    var _ref = _asyncToGenerator(function* (account) {
        if (typeof account !== 'object' || typeof account.id !== 'string') {
            log.warn('Alert.byAccount misuse: account must be an Account instance');
        }

        let params = {
            key: account.id
        };
        return yield request('allByBankAccount', params);
    });

    function byAccount(_x) {
        return _ref.apply(this, arguments);
    }

    return byAccount;
})();

Alert.byAccountAndType = (() => {
    var _ref2 = _asyncToGenerator(function* (accountID, type) {
        if (typeof accountID !== 'string') {
            log.warn('Alert.byAccountAndType misuse: accountID must be a string');
        }
        if (typeof type !== 'string') {
            log.warn('Alert.byAccountAndType misuse: type must be a string');
        }

        let params = {
            key: [accountID, type]
        };
        return yield request('allByBankAccountAndType', params);
    });

    function byAccountAndType(_x2, _x3) {
        return _ref2.apply(this, arguments);
    }

    return byAccountAndType;
})();

Alert.reportsByFrequency = (() => {
    var _ref3 = _asyncToGenerator(function* (frequency) {
        if (typeof frequency !== 'string') {
            log.warn('Alert.reportsByFrequency misuse: frequency must be a string');
        }

        let params = {
            key: ['report', frequency]
        };
        return yield request('allReportsByFrequency', params);
    });

    function reportsByFrequency(_x4) {
        return _ref3.apply(this, arguments);
    }

    return reportsByFrequency;
})();

Alert.destroyByAccount = (() => {
    var _ref4 = _asyncToGenerator(function* (id) {
        if (typeof id !== 'string') {
            log.warn("Alert.destroyByAccount API misuse: id isn't a string");
        }

        let params = {
            key: id,
            // Why the limit? See https://github.com/cozy/cozy-db/issues/41
            limit: 9999999
        };
        return yield requestDestroy('allByBankAccount', params);
    });

    function destroyByAccount(_x5) {
        return _ref4.apply(this, arguments);
    }

    return destroyByAccount;
})();

// Sync function
Alert.prototype.testTransaction = function (operation) {
    if (this.type !== 'transaction') {
        return false;
    }

    let alertLimit = +this.limit;
    let amount = Math.abs(operation.amount);
    return this.order === 'lt' && amount <= alertLimit || this.order === 'gt' && amount >= alertLimit;
};

// Sync function
Alert.prototype.testBalance = function (balance) {
    if (this.type !== 'balance') {
        return false;
    }

    let alertLimit = +this.limit;
    return this.order === 'lt' && balance <= alertLimit || this.order === 'gt' && balance >= alertLimit;
};

Alert.prototype.formatOperationMessage = function (operation, accountName, formatCurrency) {
    let cmp = this.order === 'lt' ? (0, _helpers.translate)('server.alert.operation.lessThan') : (0, _helpers.translate)('server.alert.operation.greaterThan');

    let amount = formatCurrency(operation.amount);
    let date = _helpers.formatDate.toShortString(operation.date);
    let limit = formatCurrency(this.limit);

    return (0, _helpers.translate)('server.alert.operation.content', {
        title: operation.title,
        account: accountName,
        amount,
        cmp,
        date,
        limit
    });
};

Alert.prototype.formatAccountMessage = function (title, balance, formatCurrency) {
    let cmp = this.order === 'lt' ? (0, _helpers.translate)('server.alert.balance.lessThan') : (0, _helpers.translate)('server.alert.balance.greaterThan');

    let limit = formatCurrency(this.limit);
    let formattedBalance = formatCurrency(balance);

    return (0, _helpers.translate)('server.alert.balance.content', {
        title,
        cmp,
        limit,
        balance: formattedBalance
    });
};

Alert.prototype.clone = function () {
    let clone = _extends({}, this);
    delete clone.id;
    delete clone._id;
    delete clone._rev;
    return clone;
};

module.exports = Alert;