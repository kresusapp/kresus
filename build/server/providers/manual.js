"use strict";
// This modules implements a manual access where the user fills the transactions themselves.
Object.defineProperty(exports, "__esModule", { value: true });
const account_types_1 = require("../lib/account-types");
const helpers_1 = require("../helpers");
exports.SOURCE_NAME = 'manual';
exports.fetchAccounts = async function () {
    const manualAccountLabel = helpers_1.translate('server.banks.manual_account');
    const unknownTypeId = account_types_1.accountTypeNameToId('account-type.unknown');
    return [
        {
            vendorAccountId: '1',
            label: `${manualAccountLabel} #1 (EUR)`,
            balance: 0,
            currency: 'EUR',
            type: unknownTypeId
        },
        {
            vendorAccountId: '2',
            label: `${manualAccountLabel} #2 (EUR)`,
            balance: 0,
            currency: 'EUR',
            type: unknownTypeId
        },
        {
            vendorAccountId: '3',
            label: `${manualAccountLabel} #3 (USD)`,
            balance: 0,
            currency: 'USD',
            type: unknownTypeId
        }
    ];
};
exports.fetchOperations = () => {
    return new Promise(accept => {
        accept([]);
    });
};
