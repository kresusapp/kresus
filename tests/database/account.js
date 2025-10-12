import should from 'should';

import { Access, Account } from '../../server/models';
import { importData } from '../../server/controllers/all';

describe('Account model API', () => {
    let world = {
        accesses: [
            {
                id: 0,
                vendorId: 'manual',
                login: 'whatever-manual-acc--does-not-care',
                customLabel: 'Optional custom label',
            },
        ],

        accounts: [
            {
                id: 0,
                accessId: 0,
                vendorAccountId: 'manualaccount-randomid',
                type: 'account-type.checking',
                initialBalance: 0,
                label: 'Compte Courant',
                iban: 'FR4830066645148131544778523',
                currency: 'EUR',
                importDate: new Date('2019-01-01:00:00.000Z'),
            },
        ],

        transactions: [
            {
                accountId: 0,
                type: 'type.card',
                label: 'Wholemart',
                rawLabel: 'card 07/07/2019 wholemart',
                customLabel: 'Food',
                date: new Date('2019-07-07T06:00:00.000Z'),
                importDate: new Date('2020-01-01:00:00.000Z'),
                amount: -83.8,
            },
            {
                accountId: 0,
                type: 'type.card',
                label: 'Wholemart',
                rawLabel: 'card 09/07/2019 wholemart',
                customLabel: 'Food & stuff',
                date: new Date('2019-07-09T12:00:00.000Z'),
                importDate: new Date('2020-01-01:00:00.000Z'),
                amount: -60.8,
            },
            {
                accountId: 0,
                type: 'type.card',
                label: 'amazon payments',
                rawLabel: 'carte 19/07/2019 amazon payments',
                customLabel: '1984 - George Orwell',
                date: new Date('2019-07-19T00:00:00.000Z'),
                importDate: new Date('2020-01-01:00:00.000Z'),
                amount: -20,
            },
            {
                accountId: 0,
                type: 'type.transfer',
                label: 'SEPA m. john doe 123457689 rent',
                rawLabel: 'transfer to m. john doe 123457689 rent',
                date: new Date('2019-07-27T00:00:00.000Z'),
                importDate: new Date('2020-01-01:00:00.000Z'),
                amount: -500,
            },
            {
                accountId: 0,
                type: 'type.order',
                label: 'taxes public department: fr123abc456',
                rawLabel: 'direct debit sepa taxes public department: fr123abc456',
                date: new Date('2019-08-17T00:00:00.000Z'),
                importDate: new Date('2020-01-01:00:00.000Z'),
                amount: -150,
            },
            {
                accountId: 0,
                type: 'type.withdrawal',
                label: 'ATM my pretty town center',
                date: new Date('2019-08-19T00:00:00.000Z'),
                importDate: new Date('2020-01-01:00:00.000Z'),
                amount: -20,
            },
            {
                accountId: 0,
                type: 'type.bankfee',
                rawLabel: 'commission on non euro buy 0.65eur',
                date: new Date('2019-08-22T00:00:00.000Z'),
                importDate: new Date('2020-01-01:00:00.000Z'),
                amount: -0.65,
            },
        ],
    };

    let USER_ID = null;
    before(() => {
        // applyConfig must have already been called.
        USER_ID = process.kresus.user.id;
    });

    after(async () => {
        await Access.destroyAll(USER_ID);
    });

    describe('Account computeBalance', () => {
        it('should return the right amount', async () => {
            await importData(USER_ID, world);

            const account = await Account.all(USER_ID);

            const result = await account[0].computeBalance(0);
            const expected = world.transactions.reduce((sum, tr) => sum + tr.amount, 0);
            result.should.be.approximately(expected, 0.01);
        });

        it('should return the right amount given an offset', async () => {
            const account = await Account.all(USER_ID);
            const result = await account[0].computeBalance(1337);
            const expected = world.transactions.reduce((sum, tr) => sum + tr.amount, 1337);
            result.should.be.approximately(expected, 0.01);
        });
    });

    describe('Account update', () => {
        it('should not override NULL balances', async () => {
            const access = await Access.create(USER_ID, {
                login: 'login',
                password: 'password',
                vendorId: 'manual',
            });

            const account = await Account.create(USER_ID, {
                accessId: access.id,
                vendorAccountId: 55555,
                label: 'Whatever',
                initialBalance: 0,
                importDate: new Date(),
                lastCheckDate: 0,
            });

            // Rename the account
            await Account.update(USER_ID, account.id, {
                customLabel: 'Better name',
            });

            // Account's balance in database should remain NULL
            const updatedAccount = await Account.repo().findOneBy({
                userId: USER_ID,
                id: account.id,
            });
            should(updatedAccount.balance).be.null();
        });
    });
});
