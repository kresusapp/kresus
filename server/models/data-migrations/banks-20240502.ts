/* eslint new-cap: ["error", { "capIsNewExceptions": ["In"] }]*/
import { EntityManager, In } from 'typeorm';

import { Access, AccessField } from '../';
import { makeLogger } from '../../helpers';

const log = makeLogger('models/data-migrations');

export async function updateBanks(userId: number | null, manager: EntityManager): Promise<void> {
    // Do not use transactions, as this code might be called from migrations which are already
    // happening in a transaction.

    log.info('Running data migration on banks (2024-05-02)');

    // Remove access fields from banquepopulaire, as they've changed.
    const userCondition: { userId?: number } = {};
    if (userId !== null) {
        userCondition.userId = userId;
    }

    const accesses: Access[] = await manager.find(Access, {
        select: ['id'],
        where: {
            vendorId: 'banquepopulaire',
            ...userCondition,
        },
    });

    if (accesses.length > 0) {
        await manager.delete(AccessField, {
            accessId: In(accesses.map(acc => acc.id)),
            ...userCondition,
        });

        // Also clear the password to force the user to update.
        await manager.update(
            Access,
            {
                id: In(accesses.map(acc => acc.id)),
                ...userCondition,
            },
            { password: null }
        );
    }

    log.info('Finished running data migration on banks (2024-05-02)');
}
