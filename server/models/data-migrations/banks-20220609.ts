import { makeLogger } from '../../helpers';

const log = makeLogger('models/data-migrations');

export async function updateBanks(): Promise<void> {
    // Do not use transactions, as this code might be called from migrations which are already
    // happening in a transaction.

    log.info('Running data migration on banks (2022-06-09)');

    log.info('Migration is obsolete, property was removed from model.');

    log.info('Finished running data migration on banks (2022-06-09)');
}
