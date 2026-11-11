import { type EntitySubscriberInterface, EventSubscriber, type RemoveEvent } from 'typeorm';

import Category from '../entities/categories';
import { modelEvents } from '../events';

@EventSubscriber()
export class CategoriesSubscriber implements EntitySubscriberInterface<Category> {
    listenTo() {
        return Category;
    }

    async afterRemove(event: RemoveEvent<Category>) {
        // When using the destroy method and not the remove method, the entity is not provided in
        // the event, so we cannot filter by userId, but that's fine to do it for all users.
        // See https://github.com/typeorm/typeorm/issues/6876
        await modelEvents.emitCategoriesDeleted(event.manager);
    }
}
