import should from 'should';

import { Access, Account, View, User } from '../../server/models';
import ViewAccount from '../../server/models/entities/view-accounts';

describe('Views database CRUD tests', () => {
    let USER_ID = null;
    before(() => {
        // applyConfig must have already been called.
        USER_ID = process.kresus.defaultUser.id;
    });

    let classicAccess, livretA, compteCheque, compteJoint;
    before(async () => {
        await Access.destroyAll(USER_ID);
        await View.destroyAll(USER_ID);

        classicAccess = await Access.create(USER_ID, {
            login: 'login',
            password: 'password',
            vendorId: 'whatever',
        });

        livretA = await Account.create(USER_ID, {
            accessId: classicAccess.id,
            vendorAccountId: 111111,
            label: 'Livret A',
            initialBalance: 500,
            importDate: new Date(),
            lastCheckDate: 0,
        });

        compteCheque = await Account.create(USER_ID, {
            accessId: classicAccess.id,
            vendorAccountId: 22222,
            label: 'Compte cheque',
            initialBalance: 1500,
            importDate: new Date(),
            lastCheckDate: 0,
        });

        compteJoint = await Account.create(USER_ID, {
            accessId: classicAccess.id,
            vendorAccountId: 33333,
            label: 'Compte joint',
            initialBalance: 300,
            importDate: new Date(),
            lastCheckDate: 0,
        });
    });

    it('should have created a view for each account', async () => {
        const allViews = await View.all(USER_ID);
        allViews.length.should.equal(3);
    });

    it('should create views correctly', async () => {
        await View.create(USER_ID, {
            label: 'Look ma, I did this',
            accounts: [
                {
                    accountId: livretA.id,
                },
            ],
        });

        await View.create(USER_ID, {
            label: 'Look ma, I did this again',
            accounts: [
                {
                    accountId: compteCheque.id,
                },
            ],
        });

        await View.create(USER_ID, {
            label: 'Again and again',
            accounts: [
                {
                    accountId: compteCheque.id,
                },

                {
                    accountId: compteJoint.id,
                },
            ],
        });

        let views = await View.all(USER_ID);
        views.length.should.equal(6);
    });

    it('should edit & delete views correctly', async () => {
        const view = await View.create(USER_ID, {
            label: 'Look ma, I did this',
            accounts: [
                {
                    accountId: livretA.id,
                },
            ],
        });

        // Change label
        let updated = await View.update(USER_ID, view.id, {
            label: 'Look ma, I changed my name',
        });

        updated.label.should.equal('Look ma, I changed my name');

        // Change accounts
        updated = await View.update(USER_ID, view.id, {
            accounts: [
                {
                    accountId: compteCheque.id,
                },

                {
                    accountId: compteJoint.id,
                },
            ],
        });

        updated.accounts.length.should.equal(2);

        // Destroy the view
        await View.destroy(USER_ID, view.id);
    });

    it('should remove the view when an account is deleted with Account.destroy and the view had only one account', async () => {
        // Create another user with some accounts.
        let otherUser = await User.create({ login: 'nico' });
        let otherUserAccess = await Access.create(otherUser.id, {
            login: 'login-of-nico',
            password: 'bnjbvr4ever',
            vendorId: 'whatever',
        });
        await Account.create(otherUser.id, {
            accessId: otherUserAccess.id,
            vendorAccountId: 111111,
            label: 'Livret A',
            initialBalance: 500,
            importDate: new Date(),
            lastCheckDate: 0,
        });

        // Sanity check: the other user has 1 view, automatically created for this account.
        const otherUserViews = await View.all(otherUser.id);
        otherUserViews.length.should.equal(1);

        // Destroy compte cheque
        await Account.destroy(USER_ID, compteCheque.id);

        const views = await View.all(USER_ID);
        views.length.should.equal(4);

        /**
         * Should remain:
         * - view associated to Livret A (automatically).
         * - view associated to Compte Joint (automatically).
         * - view 'Look ma, I did this' associated to Livret A only, by user
         * - view 'Again and again' since it still has one account linked (Livret A)
         */
        views.some(v => v.label === livretA.label).should.be.true();
        views.some(v => v.label === compteJoint.label).should.be.true();
        views.some(v => v.label === 'Look ma, I did this').should.be.true();
        views.some(v => v.label === 'Again and again').should.be.true();

        // This should not remove the other user's views (the one automatically created for their
        // account).
        (await View.all(otherUser.id)).length.should.equal(1);

        // Get rid of the user, which cascades deletion of all their data.
        await User.destroy(otherUser.id);
    });

    it('should remove the view when an account is deleted by cascade with Access.destroy and the view had only one account', async () => {
        // Create a new access and account
        const accessToDestroy = await Access.create(USER_ID, {
            login: 'access-to-destroy',
            password: 'bnjbvr4ever',
            vendorId: 'whatever',
        });
        await Account.create(USER_ID, {
            accessId: accessToDestroy.id,
            vendorAccountId: 44444,
            label: 'Account to destroy 1',
            initialBalance: 300,
            importDate: new Date(),
            lastCheckDate: 0,
        });

        // Destroy the access.
        await Access.destroy(USER_ID, accessToDestroy.id);

        const views = await View.all(USER_ID);
        views.length.should.equal(4);

        /**
         * Should remain:
         * - view associated to Livret A (automatically).
         * - view associated to Compte Joint (automatically).
         * - view 'Look ma, I did this' associated to Livret A only, by user
         * - view 'Again and again' since it still has one account linked (Livret A)
         */
        views.some(v => v.label === livretA.label).should.be.true();
        views.some(v => v.label === compteJoint.label).should.be.true();
        views.some(v => v.label === 'Look ma, I did this').should.be.true();
        views.some(v => v.label === 'Again and again').should.be.true();
    });

    it('should rename the associated view when an account is renamed', async () => {
        await Account.destroyAll(USER_ID);
        await View.destroyAll(USER_ID);

        const accToRename = await Account.create(USER_ID, {
            accessId: classicAccess.id,
            vendorAccountId: 55555,
            label: 'Badly named',
            initialBalance: 300,
            importDate: new Date(),
            lastCheckDate: 0,
        });

        let views = await View.all(USER_ID);
        views.length.should.equal(1);
        views[0].label.should.equal(accToRename.label);

        // Rename the account
        await Account.update(USER_ID, accToRename.id, {
            customLabel: 'Better name',
        });

        views = await View.all(USER_ID);
        views.length.should.equal(1);
        views[0].label.should.equal('Better name');
    });

    it('should remove ViewAccount properly when destroying a view', async () => {
        await View.destroyAll(USER_ID);

        const viewAccounts = await ViewAccount.all();
        should.strictEqual(viewAccounts.length, 0);
    });
});
