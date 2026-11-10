import assert from 'node:assert';

import { Access, Account } from '../../server/models';
import { modelEvents } from '../../server/models/events';

// Runs `triggeringMethod` with a temporary listener on the given event (e.g. 'AccountCreated'),
// and returns whether that listener was called.
async function isEmitted(eventName, triggeringMethod) {
    let called = false;
    const listener = () => {
        called = true;
    };

    modelEvents[`on${eventName}`](listener);
    try {
        await triggeringMethod();
    } finally {
        modelEvents[`off${eventName}`](listener);
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
        assert.ok(await isEmitted('AccountCreated', createAccount));
    });

    it('should emit accountUpdated on Account.update', async () => {
        const account = await createAccount();
        assert.ok(
            await isEmitted('AccountUpdated', () =>
                Account.update(USER_ID, account.id, { customLabel: 'Renamed' })
            )
        );
    });

    it('should emit accountsDeleted on Account.destroy', async () => {
        const account = await createAccount();
        assert.ok(await isEmitted('AccountsDeleted', () => Account.destroy(USER_ID, account.id)));
    });

    it('should emit accountsDeleted on Account.destroyAll', async () => {
        await createAccount();
        assert.ok(await isEmitted('AccountsDeleted', () => Account.destroyAll(USER_ID)));
    });

    it('should emit accessesDeleted on Access.destroy', async () => {
        assert.ok(await isEmitted('AccessesDeleted', () => Access.destroy(USER_ID, access.id)));
    });

    it('should emit accessesDeleted on Access.destroyAll', async () => {
        assert.ok(await isEmitted('AccessesDeleted', () => Access.destroyAll(USER_ID)));
    });
});
