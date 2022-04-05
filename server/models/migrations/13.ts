import { MigrationInterface, QueryRunner } from 'typeorm';

import { setDefaultRealBalance } from '../data-migrations/set-default-balance';

export class SetDefaultBalance1648536789093 implements MigrationInterface {
    public async up(q: QueryRunner): Promise<void> {
        await setDefaultRealBalance(null, q.manager);
    }

    public async down(): Promise<void> {
        // Empty
    }
}
