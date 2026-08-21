import type { EntityManager } from 'typeorm';

import { getManager } from '..';

import { run as removeMigratedFromCozydb } from './remove-migrated-from-cozydb';
import { run as removeWoobUseNss } from './remove-woob-nss-setting';

const MIGRATIONS = [removeMigratedFromCozydb, removeWoobUseNss];

export default async function runDataMigrations(userId: number): Promise<void> {
    const manager: EntityManager = getManager();

    for (const migration of MIGRATIONS) {
        await migration(userId, manager);
    }
}
