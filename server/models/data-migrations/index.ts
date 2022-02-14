import { getManager, EntityManager } from 'typeorm';

import { updateBanks as banks20200414 } from './banks-20200414';
import { updateBanks as banks20210526 } from './banks-20210526';
import { updateBanks as banks20210814 } from './banks-20210814';
import { resetManualBankAccountsBalance } from './reset-manual-accounts-balance';
import { run as removeMigratedFromCozydb } from './remove-migrated-from-cozydb';

const MIGRATIONS = [
    banks20200414,
    removeMigratedFromCozydb,
    banks20210526,
    banks20210814,
    resetManualBankAccountsBalance,
];

export default async function runDataMigrations(userId: number): Promise<void> {
    const manager: EntityManager = getManager();

    for (const migration of MIGRATIONS) {
        await migration(userId, manager);
    }
}
