import * as banks      from './banks';
import * as accesses   from './accesses';
import * as accounts   from './accounts';
import * as operations from './operations';
import * as alerts     from './alerts';
import * as categories from './categories';
import * as settings   from './settings';
import * as all        from './all';
import * as rules      from './rules';

module.exports = {

    // Initialization
    'all/': {
        get: all.all,
        post: all.import
    },
    'all/export': {
        // FIXME: deprecated
        get: all.oldExport,
        post: all.export
    },

    // Accesses
    'accesses': {
        post: accesses.create
    },
    'accessId': {
        param: accesses.preloadAccess
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
        param: accounts.preloadAccount
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
    'operations': {
        post: operations.create
    },
    'operationID': {
        param: operations.preloadOperation
    },
    'otherOperationID': {
        param: operations.preloadOtherOperation
    },
    'operations/:operationID': {
        put: operations.update
    },
    'operations/:operationID/mergeWith/:otherOperationID': {
        put: operations.merge
    },
    'operations/:operationID/:file': {
        get: operations.file
    },

    // Rules
    'rules': {
        post: rules.create
    },

    // Settings
    'settings': {
        post: settings.save
    },
    'settings/weboob': {
        put: settings.updateWeboob
    },

    'alertId': {
        param: alerts.loadAlert
    },
    'alerts': {
        post: alerts.create
    },
    'alerts/:alertId': {
        put: alerts.update,
        delete: alerts.destroy
    }
};
