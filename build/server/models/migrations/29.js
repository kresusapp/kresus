"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResetImportedManualAccountsBalance1787995963164 = void 0;
const reset_manual_accounts_balance_1 = require("../data-migrations/reset-manual-accounts-balance");
// Same as migrations 12 and 26: exporting the data used to include the computed balance of the
// manual bank accounts, and importing it back saved it as if it were a real balance, which then
// never got recomputed again.
class ResetImportedManualAccountsBalance1787995963164 {
    async up(q) {
        await (0, reset_manual_accounts_balance_1.resetManualBankAccountsBalance)(null, q.manager);
    }
    async down() {
        // Empty
    }
}
exports.ResetImportedManualAccountsBalance1787995963164 = ResetImportedManualAccountsBalance1787995963164;
