"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const manifest_1 = __importDefault(require("./manifest"));
const accesses = __importStar(require("./accesses"));
const accounts = __importStar(require("./accounts"));
const alerts = __importStar(require("./alerts"));
const all = __importStar(require("./all"));
const budgets = __importStar(require("./budgets"));
const categories = __importStar(require("./categories"));
const demo = __importStar(require("./demo"));
const instance = __importStar(require("./instance"));
const logs = __importStar(require("./logs"));
const transactions = __importStar(require("./transactions"));
const rules = __importStar(require("./rules"));
const settings = __importStar(require("./settings"));
const recurringTransactions = __importStar(require("./recurring-transactions"));
const namespace = 'api';
const routes = {
    // Initialization.
    'all/': {
        get: all.all,
        post: all.import_,
    },
    'all/import/ofx': {
        post: all.importOFX_,
    },
    'all/export': {
        post: all.export_,
    },
    // Accesses.
    accessId: {
        param: accesses.preloadAccess,
    },
    accesses: {
        post: accesses.create,
    },
    'accesses/poll': {
        get: accesses.poll,
    },
    'accesses/:accessId': {
        put: accesses.update,
        delete: accesses.destroy,
    },
    'accesses/:accessId/session': {
        delete: accesses.deleteSession,
    },
    'accesses/:accessId/fetch/transactions': {
        post: accesses.fetchTransactions,
    },
    'accesses/:accessId/fetch/accounts': {
        post: accesses.fetchAccounts,
        put: accesses.updateAndFetchAccounts,
    },
    // Accounts
    accountId: {
        param: accounts.preloadAccount,
    },
    targetAccountId: {
        param: accounts.preloadTargetAccount,
    },
    'accounts/:accountId': {
        put: accounts.update,
        delete: accounts.destroy,
    },
    'accounts/:accountId/resync-balance': {
        post: accounts.resyncBalance,
    },
    'accounts/:accountId/merge-into/:targetAccountId': {
        put: accounts.mergeInto,
    },
    // Categories
    categories: {
        post: categories.create,
    },
    categoryId: {
        param: categories.preloadCategory,
    },
    'categories/:categoryId': {
        put: categories.update,
        delete: categories.destroy,
    },
    // Transactions
    transactions: {
        post: transactions.create,
    },
    transactionID: {
        param: transactions.preloadTransaction,
    },
    otherTransactionID: {
        param: transactions.preloadOtherTransaction,
    },
    'transactions/:transactionID': {
        put: transactions.update,
        delete: transactions.destroy,
    },
    'transactions/:transactionID/mergeWith/:otherTransactionID': {
        put: transactions.merge,
    },
    // Budgets
    'budgets/:year/:month': {
        get: budgets.getByYearAndMonth,
    },
    'budgets/:budgetCatId/:year/:month': {
        put: budgets.update,
    },
    // Settings
    settings: {
        post: settings.save,
    },
    // Rules
    ruleId: {
        param: rules.preload,
    },
    otherRuleId: {
        param: rules.preloadOther,
    },
    'rules/:ruleId': {
        put: rules.update,
        delete: rules.destroy,
    },
    'rules/swap/:ruleId/:otherRuleId': {
        put: rules.swapPositions,
    },
    rules: {
        get: rules.all,
        post: rules.create,
    },
    // Instance properties
    'instance/woob': {
        get: instance.getWoobVersion,
        put: instance.updateWoob,
    },
    'instance/test-email': {
        post: instance.testEmail,
    },
    'instance/test-notification': {
        post: instance.testNotification,
    },
    alertId: {
        param: alerts.loadAlert,
    },
    alerts: {
        post: alerts.create,
    },
    'alerts/:alertId': {
        put: alerts.update,
        delete: alerts.destroy,
    },
    // Logs
    logs: {
        get: logs.getLogs,
        delete: logs.clearLogs,
    },
    // Demo
    demo: {
        post: demo.enable,
        delete: demo.disable,
    },
    // Recurring transactions
    'recurringTransactions/:accountId': {
        post: recurringTransactions.create,
        get: recurringTransactions.getByAccountId,
    },
    recurringTransactionID: {
        param: recurringTransactions.preload,
    },
    'recurringTransactions/:recurringTransactionID': {
        delete: recurringTransactions.destroy,
        put: recurringTransactions.update,
    },
};
const exportedRoutes = {};
for (const [key, entry] of Object.entries(routes)) {
    exportedRoutes[`${namespace}/${key}`] = entry;
}
exports.default = Object.assign({}, manifest_1.default, exportedRoutes);
