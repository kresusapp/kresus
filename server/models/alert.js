import * as americano from 'cozydb';
import { makeLogger, promisify, promisifyModel,
         translate as $t } from '../helpers';

let log = makeLogger('models/alert');

let Alert = americano.getModel('bankalert', {
    // external (backend) account id
    bankAccount: String,

    // possible options are: report, balance, transaction
    type: String,

    // only for reports : daily, weekly, monthly
    frequency: String,
    // only for balance/transaction
    limit: Number,
    // only for balance/transaction: gt, lt
    order: String
});

Alert = promisifyModel(Alert);

let request = promisify(::Alert.request);
let requestDestroy = promisify(::Alert.requestDestroy);

Alert.byAccount = async function byAccount(account) {
    if (typeof account !== 'object' || typeof account.id !== 'string')
        log.warn('Alert.byAccount misuse: account must be an Account instance');

    let params = {
        key: account.id
    };
    return await request('allByBankAccount', params);
};

Alert.byAccountAndType = async function byAccountAndType(accountID, type) {
    if (typeof accountID !== 'string')
        log.warn('Alert.byAccountAndType misuse: accountID must be a string');
    if (typeof type !== 'string')
        log.warn('Alert.byAccountAndType misuse: type must be a string');

    let params = {
        key: [accountID, type]
    };
    return await request('allByBankAccountAndType', params);
};

Alert.reportsByFrequency = async function reportsByFrequency(frequency) {
    if (typeof frequency !== 'string')
        log.warn('Alert.reportsByFrequency misuse: frequency must be a string');

    let params = {
        key: ['report', frequency]
    };
    return await request('allReportsByFrequency', params);
};

Alert.destroyByAccount = async function destroyByAccount(id) {
    if (typeof id !== 'string')
        log.warn("Alert.destroyByAccount API misuse: id isn't a string");

    let params = {
        key: id,
        // Why the limit? See https://github.com/cozy/cozy-db/issues/41
        limit: 9999999
    };
    return await requestDestroy('allByBankAccount', params);
};

// Sync function
Alert.prototype.testTransaction = function(operation) {
    if (this.type !== 'transaction')
        return false;

    let alertLimit = +this.limit;
    let amount = Math.abs(operation.amount);
    return (this.order === 'lt' && amount <= alertLimit) ||
           (this.order === 'gt' && amount >= alertLimit);
};

// Sync function
Alert.prototype.testBalance = function(balance) {
    if (this.type !== 'balance')
        return false;

    let alertLimit = +this.limit;
    return (this.order === 'lt' && balance <= alertLimit) ||
           (this.order === 'gt' && balance >= alertLimit);
};

Alert.prototype.formatOperationMessage = function(operation, accountName) {
    let cmp = this.order === 'lt' ? $t('server.alert.operation.lessThan') :
                                    $t('server.alert.operation.greaterThan');
    let amount = operation.amount;
    let account = accountName;
    let title = operation.title;
    return $t('server.alert.operation.content', {
        title,
        account,
        amount,
        cmp,
        limit: this.limit
    });
};

Alert.prototype.formatAccountMessage = function(title, balance) {
    let cmp = this.order === 'lt' ? $t('server.alert.balance.lessThan') :
                                    $t('server.alert.balance.greaterThan');
    return $t('server.alert.balance.content', {
        title,
        cmp,
        limit: this.limit,
        balance
    });
};

module.exports = Alert;
