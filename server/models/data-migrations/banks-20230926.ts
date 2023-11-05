/* eslint new-cap: ["error", { "capIsNewExceptions": ["In"] }]*/
import { EntityManager, In } from 'typeorm';

import { Access, AccessField } from '../';
import { makeLogger } from '../../helpers';

const log = makeLogger('models/data-migrations');

export async function updateBanks(userId: number | null, manager: EntityManager): Promise<void> {
    // Do not use transactions, as this code might be called from migrations which are already
    // happening in a transaction.

    log.info('Running data migration on banks (2023-09-26)');

    const userCondition: { userId?: number } = {};
    if (userId !== null) {
        userCondition.userId = userId;
    }

    // Rename barclays to milleis.

    log.info('> Renaming barclays to milleis...');
    await manager.update(
        Access,
        {
            vendorId: 'barclays',
            ...userCondition,
        },
        { vendorId: 'milleis' }
    );

    // Rename aviva to abeilleassurances.

    log.info('> Renaming aviva to abeilleassurances...');
    await manager.update(
        Access,
        {
            vendorId: 'aviva',
            ...userCondition,
        },
        { vendorId: 'abeilleassurances' }
    );

    // Remove access fields from allianzbank and milleis.
    const accesses: Access[] = await manager.find(Access, {
        select: ['id'],
        where: {
            vendorId: In(['allianzbanque', 'milleis']),
            ...userCondition,
        },
    });

    if (accesses.length > 0) {
        await manager.delete(AccessField, {
            accessId: In(accesses.map(acc => acc.id)),
            ...userCondition,
        });
    }

    log.info('Finished running data migration on banks (2023-09-26)');
}
