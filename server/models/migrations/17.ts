import { MigrationInterface, QueryRunner } from 'typeorm';

import { run as removeWoobUseNss } from '../data-migrations/remove-woob-nss-setting';

export class RemoveWoobUseNss1692772704000 implements MigrationInterface {
    public async up(q: QueryRunner): Promise<void> {
        await removeWoobUseNss(null, q.manager);
    }

    public async down(): Promise<void> {
        // Empty
    }
}
