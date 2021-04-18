/* eslint new-cap: ["error", { "capIsNewExceptions": ["In"] }]*/
import { EntityManager, In } from 'typeorm';

import { Access, AccessField } from '../';
import { makeLogger } from '../../helpers';

const log = makeLogger('models/data-migrations');

export async function updateBanks(userId: number | null, manager: EntityManager): Promise<void> {
    // Do not use transactions, as this code might be called from migrations which are already
    // happening in a transaction.

    log.info('Running data migration on banks (2020-04-14)');

    // Remove access fields from boursorama, cmmc, ganassurances.
    const userCondition: { userId?: number } = {};
    if (userId !== null) {
        userCondition.userId = userId;
    }

    const accesses: Access[] = await manager.find(Access, {
        select: ['id'],
        where: {
            vendorId: In(['boursorama', 'cmmc', 'ganassurances']),
            ...userCondition,
        },
    });

    if (accesses.length > 0) {
        await manager.delete(AccessField, {
            accessId: In(accesses.map(acc => acc.id)),
            ...userCondition,
        });

        // Migrate cmmc to creditmutuel.
        await manager.update(
            Access,
            {
                vendorId: 'cmmc',
                ...userCondition,
            },
            { vendorId: 'creditmutuel' }
        );
    }

    log.info('Finished running data migration on banks (2020-04-14)');
}
