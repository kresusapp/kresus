"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResetManualAccountsBalance1759743359421 = void 0;
const reset_manual_accounts_balance_1 = require("../data-migrations/reset-manual-accounts-balance");
// Same as migration 12, but a bug was introduce in version 0.23.0 that set a balance to
// the manual bank accounts.
class ResetManualAccountsBalance1759743359421 {
    async up(q) {
        await (0, reset_manual_accounts_balance_1.resetManualBankAccountsBalance)(null, q.manager);
    }
    async down() {
        // Empty
    }
}
exports.ResetManualAccountsBalance1759743359421 = ResetManualAccountsBalance1759743359421;
