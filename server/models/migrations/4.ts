import { MigrationInterface, QueryRunner } from 'typeorm';

import { updateBanks } from '../data-migrations/banks-20200414';

// Banks update, 2020-04-14
export class BanksUpdate1586890559919 implements MigrationInterface {
    public async up(q: QueryRunner): Promise<void> {
        await updateBanks(null, q.manager);
    }

    public async down(): Promise<void> {
        // Empty
    }
}
