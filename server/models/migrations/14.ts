import { MigrationInterface, QueryRunner } from 'typeorm';

import { updateBanks } from '../data-migrations/banks-20220609';

// Banks update, 2022-06-09
export class BanksUpdate1654732800000 implements MigrationInterface {
    public async up(q: QueryRunner): Promise<void> {
        await updateBanks(null, q.manager);
    }

    public async down(): Promise<void> {
        // Empty
    }
}
