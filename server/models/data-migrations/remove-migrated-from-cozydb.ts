import type { EntityManager } from 'typeorm';
import { makeLogger } from '../../helpers';
import { Setting } from '../';

const log = makeLogger('models/data-migrations');

export async function run(userId: number | null, manager: EntityManager): Promise<void> {
    log.info('Running data migration: remove unused migrated-from-cozydb');

    const userCondition: { userId?: number } = {};
    if (userId !== null) {
        userCondition.userId = userId;
    }

    await manager.delete(Setting, {
        key: 'migrated-from-cozydb',
        ...userCondition,
    });

    log.info('Finished data migration: remove unused migrated-from-cozydb');
}
