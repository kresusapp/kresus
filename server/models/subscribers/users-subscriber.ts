import { type EntitySubscriberInterface, EventSubscriber, type RemoveEvent } from 'typeorm';

import User from '../entities/users';
import { modelEvents } from '../events';

@EventSubscriber()
export class UsersSubscriber implements EntitySubscriberInterface<User> {
    listenTo() {
        return User;
    }

    async afterRemove(event: RemoveEvent<User>) {
        // When using the destroy method and not the remove method, the entity is not provided in
        // the event, so we cannot filter by userId.
        // See https://github.com/typeorm/typeorm/issues/6876
        await modelEvents.emitUsersDeleted(event.manager);
    }
}
