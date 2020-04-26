import { MigrationInterface, QueryRunner } from 'typeorm';

import { run as removeMigratedFromCozydb } from '../data-migrations/remove-migrated-from-cozydb';

export class RemoveMigratedFromCozydb1588347903900 implements MigrationInterface {
    public async up(q: QueryRunner): Promise<void> {
        await removeMigratedFromCozydb(null, q.manager);
    }

    public async down(): Promise<void> {
        // Empty
    }
}
