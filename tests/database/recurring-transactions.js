import should from 'should';

import {
    Access,
    Account,
    RecurringTransaction,
    AppliedRecurringTransaction,
} from '../../server/models';
import { importData } from '../../server/controllers/all';
import deepcopy from 'lodash.clonedeep';

const world = {
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

        {
            id: 1,
            accessId: 0,
            vendorAccountId: 'manualaccount-randomid2',
            type: 'account-type.checking',
            initialBalance: 0,
            label: 'Compte Courant 2',
            iban: 'FR4830066645148131544778524',
            currency: 'EUR',
            importDate: new Date('2022-01-01:00:00.000Z'),
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
    ],
};

describe('RecurringTransaction model API', () => {
    let USER_ID = null;
    before(() => {
        // applyConfig must have already been called.
        USER_ID = process.kresus.user.id;
    });

    describe('RecurringTransaction creation/edition/deletion', () => {
        let smallWorld = deepcopy(world);
        let recurrentTrId = -1;

        before(async () => {
            await Access.destroyAll(USER_ID);
            await importData(USER_ID, smallWorld);
        });

        it('Creation of a recurring transaction should work', async () => {
            // `smallWorld` was mutated upon import, the accountId changed.
            const accountId = smallWorld.operations[0].accountId;
            const recurrentTr = await RecurringTransaction.create(USER_ID, {
                accountId,
                type: 'type.card',
                label: 'Test recurring transaction',
                amount: 1337,
                dayOfMonth: 12,
                listOfMonths: 'all',
            });

            recurrentTrId = recurrentTr.id;
        });

        it('Retrieval of a recurring transaction should work', async () => {
            const recurrentTr = await RecurringTransaction.find(USER_ID, recurrentTrId);
            should(recurrentTr).not.be.null();
        });

        it('Edition of a recurring transaction should work', async () => {
            const fieldsToUpdate = {
                // accountId: 2,
                type: 'type.check',
                label: 'Totally new label',
                amount: 7331,
                dayOfMonth: 11,
                listOfMonths: '1;12',
            };

            await RecurringTransaction.update(USER_ID, recurrentTrId, fieldsToUpdate);

            const recurrentTr = await RecurringTransaction.find(USER_ID, recurrentTrId);
            recurrentTr.type.should.equal(fieldsToUpdate.type);
            recurrentTr.label.should.equal(fieldsToUpdate.label);
            recurrentTr.amount.should.equal(fieldsToUpdate.amount);
            recurrentTr.dayOfMonth.should.equal(fieldsToUpdate.dayOfMonth);
            recurrentTr.listOfMonths.should.equal(fieldsToUpdate.listOfMonths);
            // Account id should not be changed
            recurrentTr.accountId.should.equal(smallWorld.operations[0].accountId);
        });

        it('Deletion of a recurring transaction should work', async () => {
            await RecurringTransaction.destroy(USER_ID, recurrentTrId);

            const exists = await RecurringTransaction.exists(USER_ID, recurrentTrId);
            should(exists).be.false();

            const all = await RecurringTransaction.all(USER_ID);
            should(all.length).equal(0);
        });

        it('Deletion of a parent account should destroy recurring transactions', async () => {
            const accountId = smallWorld.operations[0].accountId;
            const recurrentTr = await RecurringTransaction.create(USER_ID, {
                accountId,
                type: 'type.card',
                label: 'Test recurring transaction on soon to be deleted account',
                amount: 123,
                dayOfMonth: 12,
                listOfMonths: 'all',
            });

            recurrentTrId = recurrentTr.id;

            // Destroy the account
            await Account.destroy(USER_ID, accountId);

            const all = await RecurringTransaction.all(USER_ID);
            should(all.length).equal(0);
        });

        it('Validation of a months list should return the right state', () => {
            RecurringTransaction.isValidListOfMonths('all').should.be.true();
            RecurringTransaction.isValidListOfMonths('1;2;3;4;5;6;7;8;9;10;11;12').should.be.true();
            RecurringTransaction.isValidListOfMonths('1;12').should.be.true();
            RecurringTransaction.isValidListOfMonths('10').should.be.true();

            RecurringTransaction.isValidListOfMonths('ALL').should.be.false();
            RecurringTransaction.isValidListOfMonths(
                '0;2;3;4;5;6;7;8;9;10;11;12'
            ).should.be.false();
            RecurringTransaction.isValidListOfMonths(
                '1;2;3;4;5;6;7;8;9;10;11;13'
            ).should.be.false();
        });
    });

    describe('AppliedRecurringTransaction creation/deletion/retrieval', () => {
        let smallWorld = deepcopy(world);

        before(async () => {
            await Access.destroyAll(USER_ID);
            await importData(USER_ID, smallWorld);
        });

        it('Creation of an applied recurring transaction should work', async () => {
            // Create 3 recurring transactions
            const accountId = smallWorld.operations[0].accountId;
            const recurrentTransactionData = {
                accountId,
                type: 'type.card',
                label: 'Test recurring transaction on soon to be deleted account',
                amount: 123,
                dayOfMonth: 1,
                listOfMonths: 'all',
            };

            const recurrentTr = await RecurringTransaction.create(
                USER_ID,
                recurrentTransactionData
            );

            await RecurringTransaction.create(USER_ID, {
                ...recurrentTransactionData,
                label: 'Second',
            });
            await RecurringTransaction.create(USER_ID, {
                ...recurrentTransactionData,
                label: 'Third',
            });

            // Create 1 applied recurring transactions.
            await AppliedRecurringTransaction.create(USER_ID, {
                recurringTransactionId: recurrentTr.id,
                accountId,
                month: 12,
                year: 2022,
            });

            // Also create one recurring transaction for another account.
            await RecurringTransaction.create(USER_ID, {
                accountId: accountId + 1,
                type: 'type.card',
                label: 'Test recurring transaction on other account',
                amount: 123.45,
                dayOfMonth: 15,
                listOfMonths: 'all',
            });
        });

        it('Retrieval of missing recurring transactions for a given month/year should work', async () => {
            // 2 applied transactions should be missing.
            const accountId = smallWorld.operations[0].accountId;
            const missing = await RecurringTransaction.getCurrentMonthMissingRecurringTransactions(
                USER_ID,
                accountId,
                12,
                2022
            );

            missing.should.be.Array();
            missing.length.should.equal(2);
            missing.some(rt => rt.accountId !== accountId).should.be.false();
        });

        it('Deletion of a parent recurring transaction should delete applied recurrent transactions too', async () => {
            // Destroy the recurrent transaction
            await RecurringTransaction.destroyAll(USER_ID);

            const all = await AppliedRecurringTransaction.all(USER_ID);
            should(all.length).equal(0);
        });
    });
});
