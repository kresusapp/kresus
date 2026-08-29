import type { MigrationInterface, QueryRunner } from 'typeorm';

import { resetManualBankAccountsBalance } from '../data-migrations/reset-manual-accounts-balance';

// Same as migrations 12 and 26: exporting the data used to include the computed balance of the
// manual bank accounts, and importing it back saved it as if it were a real balance, which then
// never got recomputed again.
export class ResetImportedManualAccountsBalance1787995963164 implements MigrationInterface {
    public async up(q: QueryRunner): Promise<void> {
        await resetManualBankAccountsBalance(null, q.manager);
    }

    public async down(): Promise<void> {
        // Empty
    }
}
