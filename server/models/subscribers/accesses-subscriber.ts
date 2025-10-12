import { EventSubscriber, EntitySubscriberInterface } from 'typeorm';

import Access from '../entities/accesses';
import View from '../entities/views';

// eslint new-cap rule does not like decorators. See https://github.com/eslint/typescript-eslint-parser/issues/569
// eslint-disable-next-line new-cap
@EventSubscriber()
export class AccessesSubscriber implements EntitySubscriberInterface<Access> {
    listenTo() {
        return Access;
    }

    /* Deletes views without accounts after access deletion (the cascade does not call any account
    subscription) */
    async afterRemove() {
        // When using the destroy method and not the remove method, the entity is not provided in
        // the event, so we cannot filter by userId, but that's fine to do it for all users.
        // See https://github.com/typeorm/typeorm/issues/6876
        await View.destroyViewsWithoutAccounts();
    }
}
