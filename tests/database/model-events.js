import assert from 'node:assert';

import { Access, Account, Category, Transaction, User } from '../../server/models';
import { ModelEvent, modelEvents } from '../../server/models/events';

// Runs `triggeringMethod` with a temporary listener on the given event (e.g.
// `ModelEvent.AccountCreated`), and returns whether that listener was called.
async function isEmitted(eventName, triggeringMethod) {
    let called = false;
    const listener = () => {
        called = true;
    };

    modelEvents.on(eventName, listener);
    try {
        await triggeringMethod();
    } finally {
        modelEvents.off(eventName, listener);
    }

    return called;
}

describe('Model events', () => {
    let USER_ID = null;
    let access = null;

    const createAccount = () =>
        Account.create(USER_ID, {
            accessId: access.id,
            vendorAccountId: 1,
            label: 'Account',
            initialBalance: 0,
            importDate: new Date(),
            lastCheckDate: 0,
        });

    const createTransaction = async () => {
        const account = await createAccount();
        return Transaction.create(USER_ID, makeTransaction(account.id));
    };

    const makeTransaction = accountId => ({
        accountId,
        type: 'type.card',
        label: 'Transaction',
        rawLabel: 'Transaction',
        amount: -10,
        date: new Date(),
        importDate: new Date(),
    });

    before(() => {
        // applyConfig must have already been called.
        USER_ID = process.kresus.defaultUser.id;
    });

    beforeEach(async () => {
        await Access.destroyAll(USER_ID);
        access = await Access.create(USER_ID, { vendorId: 'whatever', fields: [] });
    });

    after(async () => {
        await Access.destroyAll(USER_ID);
    });

    it('should emit accountCreated on Account.create', async () => {
        assert.ok(await isEmitted(ModelEvent.AccountCreated, createAccount));
    });

    it('should emit accountUpdated on Account.update', async () => {
        const account = await createAccount();
        assert.ok(
            await isEmitted(ModelEvent.AccountUpdated, () =>
                Account.update(USER_ID, account.id, { customLabel: 'Renamed' })
            )
        );
    });

    it('should emit accountsDeleted on Account.destroy', async () => {
        const account = await createAccount();
        assert.ok(
            await isEmitted(ModelEvent.AccountsDeleted, () => Account.destroy(USER_ID, account.id))
        );
    });

    it('should emit accountsDeleted on Account.destroyAll', async () => {
        await createAccount();
        assert.ok(await isEmitted(ModelEvent.AccountsDeleted, () => Account.destroyAll(USER_ID)));
    });

    it('should emit accessesDeleted on Access.destroy', async () => {
        assert.ok(
            await isEmitted(ModelEvent.AccessesDeleted, () => Access.destroy(USER_ID, access.id))
        );
    });

    it('should emit accessesDeleted on Access.destroyAll', async () => {
        assert.ok(await isEmitted(ModelEvent.AccessesDeleted, () => Access.destroyAll(USER_ID)));
    });

    it('should emit transactionCreated on Transaction.create', async () => {
        const account = await createAccount();
        assert.ok(
            await isEmitted(ModelEvent.TransactionCreated, () =>
                Transaction.create(USER_ID, makeTransaction(account.id))
            )
        );
    });

    it('should emit transactionCreated on Transaction.bulkCreate', async () => {
        const account = await createAccount();
        assert.ok(
            await isEmitted(ModelEvent.TransactionCreated, () =>
                Transaction.bulkCreate(USER_ID, [makeTransaction(account.id)])
            )
        );
    });

    it('should emit transactionsUpdated on Transaction.update', async () => {
        const transaction = await createTransaction();
        assert.ok(
            await isEmitted(ModelEvent.TransactionsUpdated, () =>
                Transaction.update(USER_ID, transaction.id, { customLabel: 'Renamed' })
            )
        );
    });

    it('should emit transactionsDeleted on Transaction.destroy', async () => {
        const transaction = await createTransaction();
        assert.ok(
            await isEmitted(ModelEvent.TransactionsDeleted, () =>
                Transaction.destroy(USER_ID, transaction.id)
            )
        );
    });

    it('should emit categoriesDeleted on Category.destroy', async () => {
        const category = await Category.create(USER_ID, { label: 'Category', color: '#ff0000' });
        assert.ok(
            await isEmitted(ModelEvent.CategoriesDeleted, () =>
                Category.destroy(USER_ID, category.id)
            )
        );
    });

    it('should emit usersDeleted on User.destroy', async () => {
        // The test user is shared with the other test suites: delete another one.
        const user = await User.create({ login: 'model-events-user' });
        assert.ok(await isEmitted(ModelEvent.UsersDeleted, () => User.destroy(user.id)));
    });
});
