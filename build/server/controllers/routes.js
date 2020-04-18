"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const manifest_1 = __importDefault(require("./manifest"));
const accesses = __importStar(require("./accesses"));
const accounts = __importStar(require("./accounts"));
const operations = __importStar(require("./operations"));
const alerts = __importStar(require("./alerts"));
const categories = __importStar(require("./categories"));
const budgets = __importStar(require("./budgets"));
const settings = __importStar(require("./settings"));
const all = __importStar(require("./all"));
const logs = __importStar(require("./logs"));
const demo = __importStar(require("./demo"));
const namespace = 'api';
const routes = {
    // Initialization.
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
    // Accesses.
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
    'settings/test-notification': {
        post: settings.testNotification
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
exports.default = Object.assign({}, manifest_1.default, exportedRoutes);
