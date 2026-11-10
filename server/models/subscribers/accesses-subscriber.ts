import { type EntitySubscriberInterface, EventSubscriber, type RemoveEvent } from 'typeorm';

import Access from '../entities/accesses';
import { modelEvents } from '../events';

@EventSubscriber()
export class AccessesSubscriber implements EntitySubscriberInterface<Access> {
    listenTo() {
        return Access;
    }

    async afterRemove(event: RemoveEvent<Access>) {
        // When using the destroy method and not the remove method, the entity is not provided in
        // the event, so we cannot filter by userId, but that's fine to do it for all users.
        // See https://github.com/typeorm/typeorm/issues/6876
        await modelEvents.emitAccessesDeleted(event.manager);
    }
}
