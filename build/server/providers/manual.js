"use strict";
// This modules implements a manual access where the user fills the transactions themselves.
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports._ = exports.fetchTransactions = exports.fetchAccounts = exports.SOURCE_NAME = void 0;
const account_types_1 = require("../lib/account-types");
const helpers_1 = require("../helpers");
const accounts_1 = __importDefault(require("../models/entities/accounts"));
const translator_1 = require("../lib/translator");
exports.SOURCE_NAME = 'manual';
const fetchAccounts = async (opts) => {
    // If there are existing accounts, return them.
    const accounts = await accounts_1.default.byAccess(opts.access.userId, opts.access);
    if (accounts.length) {
        return {
            kind: 'values',
            values: accounts.map(acc => ({
                vendorAccountId: acc.vendorAccountId,
                label: acc.label,
                currency: acc.currency || 'EUR',
                type: (0, account_types_1.accountTypeNameToId)(acc.type),
            })),
        };
    }
    const accessCurrencyField = opts.access.fields.find(f => f.name === 'currency');
    const currency = accessCurrencyField ? accessCurrencyField.value : 'EUR';
    const i18n = await (0, translator_1.getTranslator)(opts.access.userId);
    const manualAccountLabel = (0, helpers_1.translate)(i18n, 'server.banks.manual_account');
    const unknownTypeId = (0, account_types_1.accountTypeNameToId)('account-type.unknown');
    return {
        kind: 'values',
        values: [
            {
                vendorAccountId: '1',
                label: `${manualAccountLabel} #1`,
                // No balance
                currency,
                type: unknownTypeId,
            },
            {
                vendorAccountId: '2',
                label: `${manualAccountLabel} #2`,
                // No balance
                currency,
                type: unknownTypeId,
            },
            {
                vendorAccountId: '3',
                label: `${manualAccountLabel} #3`,
                // No balance
                currency,
                type: unknownTypeId,
            },
        ],
    };
};
exports.fetchAccounts = fetchAccounts;
const fetchTransactions = () => {
    return Promise.resolve({ kind: 'values', values: [] });
};
exports.fetchTransactions = fetchTransactions;
exports._ = {
    SOURCE_NAME: exports.SOURCE_NAME,
    fetchAccounts: exports.fetchAccounts,
    fetchTransactions: exports.fetchTransactions,
};
