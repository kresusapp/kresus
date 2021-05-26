import { MigrationInterface, QueryRunner } from 'typeorm';

import { updateBanks } from '../data-migrations/banks-20210526';

// Banks update, 2021-05-26
export class BanksUpdate1622062715989 implements MigrationInterface {
    public async up(q: QueryRunner): Promise<void> {
        await updateBanks(null, q.manager);
    }

    public async down(): Promise<void> {
        // Empty
    }
}
