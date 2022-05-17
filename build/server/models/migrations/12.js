"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResetManualAccountsBalance1644419062702 = void 0;
const reset_manual_accounts_balance_1 = require("../data-migrations/reset-manual-accounts-balance");
class ResetManualAccountsBalance1644419062702 {
    async up(q) {
        await (0, reset_manual_accounts_balance_1.resetManualBankAccountsBalance)(null, q.manager);
    }
    async down() {
        // Empty
    }
}
exports.ResetManualAccountsBalance1644419062702 = ResetManualAccountsBalance1644419062702;
