import { EventEmitter } from 'events';
import type { EntityManager } from 'typeorm';

import type Account from './entities/accounts';

type AccountEvent = {
    // On account creation, it is the instance passed to the save method, but with its generated id.
    // Its balance is not computed.
    // On account update it is the updated instance.
    account: Account;
};

export const ModelEvent = {
    AccountCreated: 'account-created',
    AccountUpdated: 'account-updated',

    // Might be called on a bulk deletion, for several accounts. That's why there is no data passed
    // to listeners. (see https://github.com/typeorm/typeorm/issues/6876)
    AccountsDeleted: 'accounts-deleted',

    // Might be called on a bulk deletion, for several accesses. That's why there is no data passed
    // to listeners. (see https://github.com/typeorm/typeorm/issues/6876)
    AccessesDeleted: 'accesses-deleted',
} as const;

// Arguments received by the listeners of each event. Listeners may be asynchronous (see
// `emitAndWait` for how they are run). They always receive the entity manager of the operation
// which triggered the event first, so that they can do their work inside the same transaction.
type ModelEventMap = {
    [ModelEvent.AccountCreated]: [manager: EntityManager, event: AccountEvent];
    [ModelEvent.AccountUpdated]: [manager: EntityManager, event: AccountEvent];
    [ModelEvent.AccountsDeleted]: [manager: EntityManager];
    [ModelEvent.AccessesDeleted]: [manager: EntityManager];
};

class ModelEvents extends EventEmitter<ModelEventMap> {
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
    private async emitAndWait<K extends keyof ModelEventMap>(
        name: K,
        ...args: ModelEventMap[K]
    ): Promise<void> {
        // The listener type of `EventEmitter` returns `void`, but ours may return a promise.
        const listeners = this.listeners(name) as unknown as ((
            ...listenerArgs: ModelEventMap[K]
        ) => Promise<void> | void)[];
        for (const listener of listeners) {
            await listener(...args);
        }
    }

    async emitAccountCreated(manager: EntityManager, event: AccountEvent): Promise<void> {
        await this.emitAndWait(ModelEvent.AccountCreated, manager, event);
    }

    async emitAccountUpdated(manager: EntityManager, event: AccountEvent): Promise<void> {
        await this.emitAndWait(ModelEvent.AccountUpdated, manager, event);
    }

    async emitAccountsDeleted(manager: EntityManager): Promise<void> {
        await this.emitAndWait(ModelEvent.AccountsDeleted, manager);
    }

    async emitAccessesDeleted(manager: EntityManager): Promise<void> {
        await this.emitAndWait(ModelEvent.AccessesDeleted, manager);
    }
}

export const modelEvents = new ModelEvents();
