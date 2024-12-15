import should from 'should';

import { Access, Account, View } from '../../server/models';

describe('Views database CRUD tests', () => {
    let USER_ID = null;
    before(() => {
        // applyConfig must have already been called.
        USER_ID = process.kresus.user.id;
    });

    let livretA, compteCheque, compteJoint;
    before(async () => {
        const classicAccess = await Access.create(USER_ID, {
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
        views.length.should.equal(3);
    });

    it('should remove the view when an account is deleted and the view had only one account', async () => {
        // Destroy compte cheque
        await Account.destroy(USER_ID, compteCheque.id);

        // Destroy obsolete accounts
        await View.destroyViewsWithoutAccounts(USER_ID);

        const views = await View.all(USER_ID);
        views.length.should.equal(2);
        views[0].accounts.length.should.equal(1);
        views[0].accounts[0].id.should.equal(livretA.id);
        views[1].accounts.length.should.equal(1);
        views[1].accounts[0].id.should.equal(compteJoint.id);
    });
});
