import * as accesses from './accesses';
import * as accounts from './accounts';
import * as operations from './operations';
import * as alerts from './alerts';
import * as categories from './categories';
import * as budgets from './budgets';
import * as settings from './settings';
import * as all from './all';
import * as logs from './logs';
import * as demo from './demo';

const namespace = 'api/v1';

const routes = {
    // Initialization
    'all/': {
        get: all.all,
        post: all.import_
    },
    'all/import/ofx': {
        post: all.importOFX_
    },
    'all/export': {
        post: all.export_
    },

    // Accesses
    accessId: {
        param: accesses.preloadAccess
    },
    accesses: {
        post: accesses.create
    },
    'accesses/poll': {
        get: accesses.poll
    },
    'accesses/:accessId': {
        put: accesses.update,
        delete: accesses.destroy
    },
    'accesses/:accessId/fetch/operations': {
        get: accesses.fetchOperations
    },
    'accesses/:accessId/fetch/accounts': {
        get: accesses.fetchAccounts,
        put: accesses.updateAndFetchAccounts
    },

    // Accounts
    accountId: {
        param: accounts.preloadAccount
    },
    'accounts/:accountId': {
        put: accounts.update,
        delete: accounts.destroy
    },
    'accounts/:accountId/resync-balance': {
        get: accounts.resyncBalance
    },

    // Categories
    categories: {
        post: categories.create
    },
    categoryId: {
        param: categories.preloadCategory
    },
    'categories/:categoryId': {
        put: categories.update,
        delete: categories.destroy
    },

    // Operations
    operations: {
        post: operations.create
    },
    operationID: {
        param: operations.preloadOperation
    },
    otherOperationID: {
        param: operations.preloadOtherOperation
    },
    'operations/:operationID': {
        put: operations.update,
        delete: operations.destroy
    },
    'operations/:operationID/mergeWith/:otherOperationID': {
        put: operations.merge
    },

    // Budgets
    'budgets/:year/:month': {
        get: budgets.getByYearAndMonth
    },

    'budgets/:budgetCatId/:year/:month': {
        put: budgets.update
    },

    // Settings
    settings: {
        post: settings.save
    },
    'settings/weboob': {
        get: settings.getWeboobVersion,
        put: settings.updateWeboob
    },
    'settings/test-email': {
        post: settings.testEmail
    },

    alertId: {
        param: alerts.loadAlert
    },
    alerts: {
        post: alerts.create
    },
    'alerts/:alertId': {
        put: alerts.update,
        delete: alerts.destroy
    },

    // Logs
    logs: {
        get: logs.getLogs,
        delete: logs.clearLogs
    },

    // Demo
    demo: {
        post: demo.enable,
        delete: demo.disable
    }
};

const exportedRoutes = {};
Object.keys(routes).forEach(key => {
    exportedRoutes[`${namespace}/${key}`] = routes[key];
});

export default exportedRoutes;
