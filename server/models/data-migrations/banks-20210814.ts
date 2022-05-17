import { EntityManager } from 'typeorm';

import { Access } from '../';
import { makeLogger } from '../../helpers';

const log = makeLogger('models/data-migrations');

export async function updateBanks(userId: number | null, manager: EntityManager): Promise<void> {
    // Do not use transactions, as this code might be called from migrations which are already
    // happening in a transaction.

    log.info('Running data migration on banks (2021-08-14)');

    // Remove access fields from boursorama, cmmc, ganassurances.
    const userCondition: { userId?: number } = {};
    if (userId !== null) {
        userCondition.userId = userId;
    }

    // Rename bnporc to bnp.

    log.info('> Renaming bnporc to bnp...');
    await manager.update(
        Access,
        {
            vendorId: 'bnporc',
            ...userCondition,
        },
        { vendorId: 'bnp' }
    );

    log.info('Finished running data migration on banks (2021-08-14)');
}
