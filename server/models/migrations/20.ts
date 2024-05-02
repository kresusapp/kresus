import { MigrationInterface, QueryRunner } from 'typeorm';

import { updateBanks } from '../data-migrations/banks-20240502';

// Banks update, 2024-05-02
export class BanksUpdate1714649322180 implements MigrationInterface {
    public async up(q: QueryRunner): Promise<void> {
        await updateBanks(null, q.manager);
    }

    public async down(): Promise<void> {
        // Empty
    }
}
