/* eslint new-cap: ["error", { "capIsNewExceptions": ["In", "Not"] }]*/
import { EntityManager, In, Not } from 'typeorm';

import { Access, Account } from '..';
import { makeLogger } from '../../helpers';

const log = makeLogger('models/data-migrations');

export async function setDefaultRealBalance(
    userId: number | null,
    manager: EntityManager
): Promise<void> {
    // Do not use transactions, as this code might be called from migrations which are already
    // happening in a transaction.

    log.info('Running data migration on banks (setting default real balance)');

    // Reset the disabled accounts balance to the initial balance + sum of transactions for accounts
    // disabled prior to the implementation of "real" balance.
    const userCondition: { userId?: number } = {};
    if (userId) {
        userCondition.userId = userId;
    }

    // Filter non-manual accesses.
    const accesses = await manager.find(Access, {
        select: ['id'],
        where: {
            vendorId: Not(In(['manual', 'demo', 'fakewoobbank'])),
            ...userCondition,
        },
    });

    if (accesses.length > 0) {
        const accessesIds = accesses.map(acc => acc.id);

        const accounts = await manager.find(Account, {
            where: {
                accessId: In(accessesIds),
                ...userCondition,
            },
        });

        // Set the real balance to the previously computed balance.
        // On next poll for enabled accounts this will be updated thanks to the balance given by the
        // provider. For disabled accounts this will remain as before the real balance
        // implementation.
        for (const acc of accounts) {
            const computedBalance = await acc.computeBalance(acc.initialBalance);
            await Account.update(acc.userId, acc.id, { balance: computedBalance });
        }
    }

    log.info('Finished running data migration on disabled banks (resetting balance)');
}
