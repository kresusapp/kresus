import {
    type EntitySubscriberInterface,
    EventSubscriber,
    type InsertEvent,
    type RemoveEvent,
    type UpdateEvent,
} from 'typeorm';

import Account from '../entities/accounts';
import { modelEvents } from '../events';

@EventSubscriber()
export class AccountsSubscriber implements EntitySubscriberInterface<Account> {
    listenTo() {
        return Account;
    }

    async afterInsert(event: InsertEvent<Account>) {
        await modelEvents.emitAccountCreated(event.manager, { account: event.entity });
    }

    async afterUpdate(event: UpdateEvent<Account>) {
        const account = event.entity;
        // On a bulk update (`manager.update(Account, criteria, partialValues)`), typeorm only
        // provides the partial set of updated values, without any id or userId.
        if (
            !account ||
            typeof account.id === 'undefined' ||
            typeof account.userId === 'undefined'
        ) {
            return;
        }

        await modelEvents.emitAccountUpdated(event.manager, { account: account as Account });
    }

    async afterRemove(event: RemoveEvent<Account>) {
        // When using the destroy method and not the remove method, the entity is not provided in
        // the event, so we cannot filter by userId, but that's fine to do it for all users.
        // See https://github.com/typeorm/typeorm/issues/6876
        await modelEvents.emitAccountsDeleted(event.manager);
    }
}
