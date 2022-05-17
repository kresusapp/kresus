"use strict";
// This modules implements a manual access where the user fills the transactions themselves.
Object.defineProperty(exports, "__esModule", { value: true });
exports._ = exports.fetchOperations = exports.fetchAccounts = exports.SOURCE_NAME = void 0;
const account_types_1 = require("../lib/account-types");
const helpers_1 = require("../helpers");
const translator_1 = require("../lib/translator");
exports.SOURCE_NAME = 'manual';
const fetchAccounts = async (opts) => {
    const i18n = await (0, translator_1.getTranslator)(opts.access.userId);
    const manualAccountLabel = (0, helpers_1.translate)(i18n, 'server.banks.manual_account');
    const unknownTypeId = (0, account_types_1.accountTypeNameToId)('account-type.unknown');
    return {
        kind: 'values',
        values: [
            {
                vendorAccountId: '1',
                label: `${manualAccountLabel} #1 (EUR)`,
                // No balance
                currency: 'EUR',
                type: unknownTypeId,
            },
            {
                vendorAccountId: '2',
                label: `${manualAccountLabel} #2 (EUR)`,
                // No balance
                currency: 'EUR',
                type: unknownTypeId,
            },
            {
                vendorAccountId: '3',
                label: `${manualAccountLabel} #3 (USD)`,
                // No balance
                currency: 'USD',
                type: unknownTypeId,
            },
        ],
    };
};
exports.fetchAccounts = fetchAccounts;
const fetchOperations = () => {
    return Promise.resolve({ kind: 'values', values: [] });
};
exports.fetchOperations = fetchOperations;
exports._ = {
    SOURCE_NAME: exports.SOURCE_NAME,
    fetchAccounts: exports.fetchAccounts,
    fetchOperations: exports.fetchOperations,
};
