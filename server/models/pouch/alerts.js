import * as cozydb from 'cozydb';

import {
    assert,
    makeLogger,
    promisify,
    promisifyModel,
    translate as $t,
    formatDate
} from '../../helpers';

let log = makeLogger('models/alert');

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

Alert = promisifyModel(Alert);

let request = promisify(Alert.request.bind(Alert));

Alert.byAccountAndType = async function byAccountAndType(userId, accountID, type) {
    assert(userId === 0, 'Alert.byAccountAndType first arg must be the userId.');

    if (typeof accountID !== 'string') {
        log.warn('Alert.byAccountAndType misuse: accountID must be a string');
    }
    if (typeof type !== 'string') {
        log.warn('Alert.byAccountAndType misuse: type must be a string');
    }

    let params = {
        key: [accountID, type]
    };
    return await request('allByBankAccountAndType', params);
};

Alert.reportsByFrequency = async function reportsByFrequency(userId, frequency) {
    assert(userId === 0, 'Alert.reportsByFrequency first arg must be the userId.');

    if (typeof frequency !== 'string') {
        log.warn('Alert.reportsByFrequency misuse: frequency must be a string');
    }

    let params = {
        key: ['report', frequency]
    };
    return await request('allReportsByFrequency', params);
};

Alert.destroyByAccount = async function destroyByAccount(userId, id) {
    assert(userId === 0, 'Alert.destroyByAccount first arg must be the userId.');

    if (typeof id !== 'string') {
        log.warn("Alert.destroyByAccount API misuse: id isn't a string");
    }

    let params = {
        key: id
    };
    let alerts = await request('allByBankAccount', params);
    for (let alert of alerts) {
        await Alert.destroy(userId, alert.id);
    }
};

let olderCreate = Alert.create;
Alert.create = async function(userId, attributes) {
    assert(userId === 0, 'Alert.create first arg must be the userId.');
    return await olderCreate(attributes);
};

let olderFind = Alert.find;
Alert.find = async function(userId, alertId) {
    assert(userId === 0, 'Alert.find first arg must be the userId.');
    return await olderFind(alertId);
};

let olderAll = Alert.all;
Alert.all = async function(userId) {
    assert(userId === 0, 'Alert.all first arg must be the userId.');
    return await olderAll();
};

let olderDestroy = Alert.destroy;
Alert.destroy = async function(userId, alertId) {
    assert(userId === 0, 'Alert.destroy first arg must be the userId.');
    return await olderDestroy(alertId);
};

let olderUpdateAttributes = Alert.updateAttributes;
Alert.update = async function(userId, alertId, fields) {
    assert(userId === 0, 'Alert.update first arg must be the userId.');
    return await olderUpdateAttributes(alertId, fields);
};

Alert.updateAttributes = function() {
    assert(false, 'Alert.updateAttributes is deprecated. Please use Alert.update');
};

// Sync function
Alert.prototype.testTransaction = function(operation) {
    if (this.type !== 'transaction') {
        return false;
    }

    let alertLimit = +this.limit;
    let amount = Math.abs(operation.amount);
    return (
        (this.order === 'lt' && amount <= alertLimit) ||
        (this.order === 'gt' && amount >= alertLimit)
    );
};

// Sync function
Alert.prototype.testBalance = function(balance) {
    if (this.type !== 'balance') {
        return false;
    }

    let alertLimit = +this.limit;
    return (
        (this.order === 'lt' && balance <= alertLimit) ||
        (this.order === 'gt' && balance >= alertLimit)
    );
};

Alert.prototype.formatOperationMessage = function(operation, accountName, formatCurrency) {
    let cmp =
        this.order === 'lt'
            ? $t('server.alert.operation.lessThan')
            : $t('server.alert.operation.greaterThan');

    let amount = formatCurrency(operation.amount);
    let date = formatDate.toShortString(operation.date);
    let limit = formatCurrency(this.limit);

    return $t('server.alert.operation.content', {
        label: operation.label,
        account: accountName,
        amount,
        cmp,
        date,
        limit
    });
};

Alert.prototype.formatAccountMessage = function(label, balance, formatCurrency) {
    let cmp =
        this.order === 'lt'
            ? $t('server.alert.balance.lessThan')
            : $t('server.alert.balance.greaterThan');

    let limit = formatCurrency(this.limit);
    let formattedBalance = formatCurrency(balance);

    return $t('server.alert.balance.content', {
        label,
        cmp,
        limit,
        balance: formattedBalance
    });
};

Alert.prototype.clone = function() {
    let clone = { ...this };
    delete clone.id;
    delete clone._id;
    delete clone._rev;
    return clone;
};

module.exports = Alert;
