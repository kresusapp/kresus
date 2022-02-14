/* eslint new-cap: ["error", { "capIsNewExceptions": ["In"] }]*/
import { EntityManager, In } from 'typeorm';

import { Access, Account } from '..';
import { makeLogger } from '../../helpers';

const log = makeLogger('models/data-migrations');

export async function resetManualBankAccountsBalance(
    userId: number | null,
    manager: EntityManager
): Promise<void> {
    // Do not use transactions, as this code might be called from migrations which are already
    // happening in a transaction.

    log.info('Running data migration on manual bank (resetting balance)');

    // Reset the manual accounts balance to NULL so that the balance is computed from the
    // transactions.
    const userCondition: { userId?: number } = {};
    if (userId !== null) {
        userCondition.userId = userId;
    }

    const accesses = await manager.find(Access, {
        select: ['id'],
        where: {
            vendorId: In(['manual', 'demo']),
            ...userCondition,
        },
    });

    if (accesses.length > 0) {
        const accessesIds = accesses.map(acc => acc.id);
        await manager.update(
            Account,
            {
                accessId: In(accessesIds),
            },
            { balance: null }
        );
    }

    log.info('Finished running data migration on manual bank (resetting balance)');
}
