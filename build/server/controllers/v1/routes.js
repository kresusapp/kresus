'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _accesses = require('./accesses');

var accesses = _interopRequireWildcard(_accesses);

var _accounts = require('./accounts');

var accounts = _interopRequireWildcard(_accounts);

var _operations = require('./operations');

var operations = _interopRequireWildcard(_operations);

var _alerts = require('./alerts');

var alerts = _interopRequireWildcard(_alerts);

var _categories = require('./categories');

var categories = _interopRequireWildcard(_categories);

var _settings = require('./settings');

var settings = _interopRequireWildcard(_settings);

var _all = require('./all');

var all = _interopRequireWildcard(_all);

var _logs = require('./logs');

var logs = _interopRequireWildcard(_logs);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

const namespace = 'api/v1';

const routes = {
    // Initialization
    'all/': {
        get: all.all,
        post: all.import_
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
    'accesses/:accessId/accounts': {
        get: accesses.getAccounts
    },
    'accesses/:accessId/fetch/operations': {
        get: accesses.fetchOperations
    },
    'accesses/:accessId/fetch/accounts': {
        get: accesses.fetchAccounts
    },

    // Accounts
    accountId: {
        param: accounts.preloadAccount
    },
    'accounts/:accountId': {
        put: accounts.update,
        delete: accounts.destroy
    },
    'accounts/:accountId/operations': {
        get: accounts.getOperations
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
        get: logs.getLogs
    }
};

const exportedRoutes = {};
Object.keys(routes).forEach(key => {
    exportedRoutes[`${namespace}/${key}`] = routes[key];
});

exports.default = exportedRoutes;