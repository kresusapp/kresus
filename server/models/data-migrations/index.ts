import { getManager, EntityManager } from 'typeorm';

import { updateBanks as migration1 } from './banks-20200414';

export default async function runDataMigrations(userId: number): Promise<void> {
    const manager: EntityManager = getManager();
    const migrations = [migration1];

    for (const migration of migrations) {
        await migration(userId, manager);
    }
}
