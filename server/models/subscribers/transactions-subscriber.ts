import {
    type EntitySubscriberInterface,
    EventSubscriber,
    type InsertEvent,
    type RemoveEvent,
    type UpdateEvent,
} from 'typeorm';

import Transaction from '../entities/transactions';
import { modelEvents } from '../events';

@EventSubscriber()
export class TransactionsSubscriber implements EntitySubscriberInterface<Transaction> {
    listenTo() {
        return Transaction;
    }

    async afterInsert(event: InsertEvent<Transaction>) {
        // Called once per inserted transaction, including on bulk insertions.
        await modelEvents.emitTransactionCreated(event.manager, { transaction: event.entity });
    }

    async afterUpdate(event: UpdateEvent<Transaction>) {
        // On a bulk update (`Transaction.repo().update(criteria, partialValues)`, used by
        // `Transaction.update`), typeorm only provides the partial set of updated values, without
        // any id, userId or (former) accountId, so we cannot tell which transactions changed.
        await modelEvents.emitTransactionsUpdated(event.manager);
    }

    async afterRemove(event: RemoveEvent<Transaction>) {
        // When using the destroy method and not the remove method, the entity is not provided in
        // the event, so we cannot filter by userId, but that's fine to do it for all users.
        // See https://github.com/typeorm/typeorm/issues/6876
        await modelEvents.emitTransactionsDeleted(event.manager);
    }
}
