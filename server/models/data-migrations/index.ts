import { EntityManager } from 'typeorm';

import { getManager } from '..';

import { updateBanks as banks20200414 } from './banks-20200414';
import { updateBanks as banks20210526 } from './banks-20210526';
import { updateBanks as banks20210814 } from './banks-20210814';
import { updateBanks as banks20220609 } from './banks-20220609';
import { setDefaultRealBalance } from './set-default-balance';
import { run as removeMigratedFromCozydb } from './remove-migrated-from-cozydb';
import { run as removeWoobUseNess } from './remove-woob-nss-setting';

const MIGRATIONS = [
    banks20200414,
    removeMigratedFromCozydb,
    banks20210526,
    banks20210814,
    setDefaultRealBalance,
    banks20220609,
    removeWoobUseNess,
];

export default async function runDataMigrations(userId: number): Promise<void> {
    const manager: EntityManager = getManager();

    for (const migration of MIGRATIONS) {
        await migration(userId, manager);
    }
}
