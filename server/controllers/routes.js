import * as banks      from './banks';
import * as accesses   from './accesses';
import * as accounts   from './accounts';
import * as operations from './operations';
import * as alerts     from './alerts';
import * as categories from './categories';
import * as settings   from './settings';
import * as all        from './all';

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

    'bankAlertID': {
        param: alerts.loadAlert
    },
    'alerts': {
        post: alerts.create
    },
    'alerts/:bankAlertID': {
        put: alerts.update,
        delete: alerts.destroy
    },
};
