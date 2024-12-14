import express from 'express';

import manifestRoute from './manifest';

import * as accesses from './accesses';
import * as accounts from './accounts';
import * as alerts from './alerts';
import * as all from './all';
import * as batch from './batch';
import * as budgets from './budgets';
import * as categories from './categories';
import * as demo from './demo';
import * as instance from './instance';
import * as logs from './logs';
import * as transactions from './transactions';
import * as rules from './rules';
import * as settings from './settings';
import * as recurringTransactions from './recurring-transactions';

const namespace = 'api';

export interface IdentifiedRequest<T> extends express.Request {
    user: {
        id: number;
    };
    preloaded?: { [key: string]: T };
}

export interface PreloadedRequest<T> extends IdentifiedRequest<T> {
    preloaded: {
        [key: string]: T;
    };
}

interface RouteObject<T> {
    param?: (
        req: IdentifiedRequest<T>,
        res: express.Response,
        next: () => void,
        id: number
    ) => Promise<any>;
    get?: (req: PreloadedRequest<T>, res: express.Response) => Promise<any>;
    post?: (req: PreloadedRequest<T>, res: express.Response) => Promise<any>;
    put?: (req: PreloadedRequest<T>, res: express.Response) => Promise<any>;
    delete?: (req: PreloadedRequest<T>, res: express.Response) => Promise<any>;
}

export type RoutesDescriptor = { [key: string]: RouteObject<any> };

const routes: RoutesDescriptor = {
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

    // Batched operations.
    batch: {
        post: batch.run,
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
        post: accesses.fetchAccountsAndTransactions,
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

const exportedRoutes: { [endpoint: string]: RouteObject<any> } = {};
for (const [key, entry] of Object.entries(routes)) {
    exportedRoutes[`${namespace}/${key}`] = entry;
}

export default Object.assign({}, manifestRoute, exportedRoutes);
