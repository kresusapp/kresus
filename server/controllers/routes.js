let banks      = require('./banks');
let accesses   = require('./accesses');
let accounts   = require('./accounts');
let operations = require('./operations');
let alerts     = require('./alerts');
let categories = require('./categories');
let settings   = require('./settings');
let all        = require('./all');

module.exports = {

    // Initialization
    'all/': {
        get: all.all,
        post: all.import
    },
    'all/export': {
        get: all.export
    },

    // Accesses
    'accesses': {
        post: accesses.create
    },
    'accessId': {
        param: accesses.preloadBankAccess
    },
    'accesses/:accessId': {
        put: accesses.update,
        delete: accesses.destroy
    },
    'accesses/:accessId/fetch/operations': {
        get: accesses.fetchOperations
    },
    'accesses/:accessId/fetch/accounts': {
        get: accesses.fetchAccounts
    },

    // Accounts
    'accountId': {
        param: accounts.preloadBankAccount
    },
    'accounts/:accountId': {
        delete: accounts.destroy
    },
    'accounts/:accountId/operations': {
        get: accounts.getOperations
    },

    // Banks
    'bankId': {
        param: banks.preloadBank
    },
    'banks/:bankId': {
        delete: banks.destroy
    },
    'banks/:bankId/accounts': {
        get: banks.getAccounts
    },

    // Categories
    'categories': {
        post: categories.create
    },
    'categoryId': {
        param: categories.preloadCategory
    },
    'categories/:categoryId': {
        put: categories.update,
        delete: categories.delete
    },

    // Operations
    'bankOperationID': {
        param: operations.preloadBankOperation
    },
    'otherOperationID': {
        param: operations.preloadOtherBankOperation
    },
    'operations/:bankOperationID': {
        put: operations.update
    },
    'operations/:bankOperationID/mergeWith/:otherOperationID': {
        put: operations.merge
    },
    'operations/:bankOperationID/:file': {
        get: operations.file
    },

    // Settings
    'settings': {
        post: settings.save
    },
    'settings/weboob': {
        put: settings.updateWeboob
    },

    // TODO unused yet: alerts
    'alerts': {
        get: alerts.index,
        post: alerts.create
    },
    'bankAlertID': {
        param: alerts.loadAlert
    },
    'alerts/:bankAlertID': {
        get: alerts.show,
        put: alerts.update,
        delete: alerts.destroy
    },
    'alerts/getForBankAccount/:accountID': {
        get: alerts.getForBankAccount
    }
};
