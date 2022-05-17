import { MigrationInterface, QueryRunner } from 'typeorm';

import { resetManualBankAccountsBalance } from '../data-migrations/reset-manual-accounts-balance';

export class ResetManualAccountsBalance1644419062702 implements MigrationInterface {
    public async up(q: QueryRunner): Promise<void> {
        await resetManualBankAccountsBalance(null, q.manager);
    }

    public async down(): Promise<void> {
        // Empty
    }
}
