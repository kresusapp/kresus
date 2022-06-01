import should from 'should';

import { Access, Account, Transaction } from '../../server/models';
import { importData } from '../../server/controllers/all';

describe('Transaction model API', () => {
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

        operations: [
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

    describe('Transaction retrieval', () => {
        before(async () => {
            await Access.destroyAll(USER_ID);
        });

        it('Retrieval between two dates should work', async () => {
            await importData(USER_ID, world);

            const accounts = await Account.all(USER_ID);
            const twoFirstTransactions = await Transaction.byBankSortedByDateBetweenDates(
                USER_ID,
                accounts[0],
                world.operations[0].date,
                world.operations[1].date
            );
            twoFirstTransactions.length.should.equal(2);
            twoFirstTransactions.should.containDeep(world.operations.slice(0, 2));
        });
    });
});
