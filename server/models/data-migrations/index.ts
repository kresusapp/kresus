import { getManager, EntityManager } from 'typeorm';

import { updateBanks as banks20200414 } from './banks-20200414';
import { run as removeMigratedFromCozydb } from './remove-migrated-from-cozydb';

const MIGRATIONS = [banks20200414, removeMigratedFromCozydb];

export default async function runDataMigrations(userId: number): Promise<void> {
    const manager: EntityManager = getManager();

    for (const migration of MIGRATIONS) {
        await migration(userId, manager);
    }
}
