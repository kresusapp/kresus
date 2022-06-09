import { EntityManager } from 'typeorm';

import { Account } from '../';
import { makeLogger } from '../../helpers';

const log = makeLogger('models/data-migrations');

export async function updateBanks(userId: number | null, manager: EntityManager): Promise<void> {
    // Do not use transactions, as this code might be called from migrations which are already
    // happening in a transaction.

    log.info('Running data migration on banks (2022-06-09)');

    // Fix migrations banks-20200414 & banks-20210814 not renaming
    // the vendorId in Accounts too.
    const userCondition: { userId?: number } = {};
    if (userId !== null) {
        userCondition.userId = userId;
    }

    await manager.update(
        Account,
        {
            vendorId: 'bnporc',
            ...userCondition,
        },
        { vendorId: 'bnp' }
    );

    await manager.update(
        Account,
        {
            vendorId: 'cmmc',
            ...userCondition,
        },
        { vendorId: 'creditmutuel' }
    );

    log.info('Finished running data migration on banks (2022-06-09)');
}
