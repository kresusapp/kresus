import { EventEmitter } from 'events';
import type { EntityManager } from 'typeorm';

import type Account from './entities/accounts';

// Listeners may be asynchronous (see `emitAndWait` for how they are run). They always receive the
// entity manager of the operation which triggered the event first, so that they can do their work
// inside the same transaction.
type Listener<E> = (manager: EntityManager, event: E) => Promise<void> | void;

type AccountEvent = {
    // On account creation, it is the instance passed to the save method, but with its generated id.
    // Its balance is not computed.
    // On account update it is the updated instance.
    account: Account;
};

const ACCOUNT_CREATED = 'account-created';
const ACCOUNT_UPDATED = 'account-updated';

// Might be called on a bulk deletion, for several accounts. That's why there is no data passed
// to listeners. (see https://github.com/typeorm/typeorm/issues/6876)
const ACCOUNTS_DELETED = 'accounts-deleted';

// Might be called on a bulk deletion, for several accounts. That's why there is no data passed
// to listeners. (see https://github.com/typeorm/typeorm/issues/6876)
const ACCESSES_DELETED = 'accesses-deleted';

class ModelEvents extends EventEmitter {
    /**
     * Calls all the listeners registered for the event `name`, and resolves once all of them are
     * done. `EventEmitter` is only used to store the listeners: its `emit` method can't be used,
     * since it does not wait for asynchronous listeners (and their rejections would go unhandled).
     *
     * - Listeners are awaited, so that their side effects are done by the time the operation which
     *   emitted the event (e.g. `Account.create`) returns.
     * - Listeners are run one after the other, in registration order, never concurrently: they
     *   may share the same transaction (through `manager`), which must not run several queries at
     *   once.
     * - If a listener throws, the remaining listeners are not called and the error is propagated
     *   to the emitter. When emitted from a typeorm subscriber, this makes the triggering
     *   operation fail and its transaction, if any, roll back.
     */
    private async emitAndWait<E>(name: string, manager: EntityManager, event: E): Promise<void> {
        for (const listener of this.listeners(name) as Listener<E>[]) {
            await listener(manager, event);
        }
    }

    async emitAccountCreated(manager: EntityManager, event: AccountEvent): Promise<void> {
        await this.emitAndWait(ACCOUNT_CREATED, manager, event);
    }

    onAccountCreated(listener: Listener<AccountEvent>): this {
        return this.on(ACCOUNT_CREATED, listener);
    }

    offAccountCreated(listener: Listener<AccountEvent>): this {
        return this.off(ACCOUNT_CREATED, listener);
    }

    async emitAccountUpdated(manager: EntityManager, event: AccountEvent): Promise<void> {
        await this.emitAndWait(ACCOUNT_UPDATED, manager, event);
    }

    onAccountUpdated(listener: Listener<AccountEvent>): this {
        return this.on(ACCOUNT_UPDATED, listener);
    }

    offAccountUpdated(listener: Listener<AccountEvent>): this {
        return this.off(ACCOUNT_UPDATED, listener);
    }

    async emitAccountsDeleted(manager: EntityManager): Promise<void> {
        await this.emitAndWait(ACCOUNTS_DELETED, manager, undefined);
    }

    onAccountsDeleted(listener: Listener<void>): this {
        return this.on(ACCOUNTS_DELETED, listener);
    }

    offAccountsDeleted(listener: Listener<void>): this {
        return this.off(ACCOUNTS_DELETED, listener);
    }

    async emitAccessesDeleted(manager: EntityManager): Promise<void> {
        await this.emitAndWait(ACCESSES_DELETED, manager, undefined);
    }

    onAccessesDeleted(listener: Listener<void>): this {
        return this.on(ACCESSES_DELETED, listener);
    }

    offAccessesDeleted(listener: Listener<void>): this {
        return this.off(ACCESSES_DELETED, listener);
    }
}

export const modelEvents = new ModelEvents();
