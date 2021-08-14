import { MigrationInterface, QueryRunner } from 'typeorm';

import { updateBanks } from '../data-migrations/banks-20210814';

// Banks update, 2021-08-14
export class BanksUpdate1628960505241 implements MigrationInterface {
    public async up(q: QueryRunner): Promise<void> {
        await updateBanks(null, q.manager);
    }

    public async down(): Promise<void> {
        // Empty
    }
}
