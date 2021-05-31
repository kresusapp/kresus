/* eslint new-cap: ["error", { "capIsNewExceptions": ["In"] }]*/
import { EntityManager, In } from 'typeorm';

import { Access, AccessField } from '../';
import { makeLogger } from '../../helpers';

const log = makeLogger('models/data-migrations');

export async function updateBanks(userId: number | null, manager: EntityManager): Promise<void> {
    // Do not use transactions, as this code might be called from migrations which are already
    // happening in a transaction.

    log.info('Running data migration on banks (2021-05-26)');

    // Remove access fields from boursorama, cmmc, ganassurances.
    const userCondition: { userId?: number } = {};
    if (userId !== null) {
        userCondition.userId = userId;
    }

    // Remove the `auth_type` access field in both creditcooperatif and
    // btpbanque, which is now optional and whose set of possible value have
    // been updated.

    log.info('> Removing auth_type on creditcooperatif/btpbanque...');
    let accesses: Access[] = await manager.find(Access, {
        select: ['id'],
        where: {
            vendorId: In(['creditcooperatif', 'btpbanque']),
            ...userCondition,
        },
    });

    if (accesses.length > 0) {
        await manager.delete(AccessField, {
            accessId: In(accesses.map(acc => acc.id)),
            name: 'auth_type',
            ...userCondition,
        });
    }

    // Remove the "website" field from the bred module; it's now unused.

    log.info('> Removing website on bred...');
    accesses = await manager.find(Access, {
        select: ['id'],
        where: {
            vendorId: 'bred',
            ...userCondition,
        },
    });

    if (accesses.length > 0) {
        await manager.delete(AccessField, {
            accessId: In(accesses.map(acc => acc.id)),
            name: 'website',
            ...userCondition,
        });
    }

    log.info('Finished running data migration on banks (2021-05-26)');
}
