import { MigrationInterface, QueryRunner } from 'typeorm';

import { resetManualBankAccountsBalance } from '../data-migrations/reset-manual-accounts-balance';

// Same as migration 12, but a bug was introduce in version 0.23.0 that set a balance to
// the manual bank accounts.
export class ResetManualAccountsBalance1759743359421 implements MigrationInterface {
    public async up(q: QueryRunner): Promise<void> {
        await resetManualBankAccountsBalance(null, q.manager);
    }

    public async down(): Promise<void> {
        // Empty
    }
}
