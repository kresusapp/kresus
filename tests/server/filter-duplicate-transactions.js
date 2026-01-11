import assert from 'node:assert';

import {
    UNKNOWN_TRANSACTION_TYPE,
    DEFERRED_CARD_TYPE,
    TRANSACTION_CARD_TYPE,
    INTERNAL_TRANSFER_TYPE,
} from '../../server/helpers';
import filterDuplicateTransactions from '../../server/lib/filter-duplicate-transactions';
import moment from 'moment';

describe('filtering duplicate transactions', () => {
    const A = {
        rawLabel: 'A raw label',
        amount: 10,
        type: UNKNOWN_TRANSACTION_TYPE,
        date: new Date('1987-01-04'),
    };
    const transactionId = 2;
    const knownTransaction = { id: transactionId, ...A };

    it('the known transaction has a unknown type and the provided has a known type, the unknown type should be updated.', () => {
        const updatedType = 'fixed_type';
        const providedTransaction = { ...A, type: updatedType };
        const { toCreate, toUpdate } = filterDuplicateTransactions([
            [knownTransaction, providedTransaction],
        ]);
        assert.strictEqual(toCreate.length, 0);
        assert.strictEqual(toUpdate.length, 1);
        assert.ok('known' in toUpdate[0]);
        assert.strictEqual(toUpdate[0].known.id, transactionId);
        assert.ok('update' in toUpdate[0]);
        assert.deepStrictEqual(toUpdate[0].update, { type: updatedType });
    });

    it('the provided transaction differing by more than just the type, should be created (rawLabel change)', () => {
        const providedTransaction = { ...A, rawLabel: 'Another raw label' };
        const { toUpdate, toCreate } = filterDuplicateTransactions([
            [knownTransaction, providedTransaction],
        ]);
        assert.strictEqual(toCreate.length, 1);
        assert.strictEqual(toUpdate.length, 0);
        assert.deepStrictEqual(toCreate[0], providedTransaction);
    });

    it('the provided transaction differing by more than just the type, should be created (date change)', () => {
        const providedTransaction = { ...A, date: new Date('1987-04-02') };
        const { toUpdate, toCreate } = filterDuplicateTransactions([
            [knownTransaction, providedTransaction],
        ]);
        assert.strictEqual(toCreate.length, 1);
        assert.strictEqual(toUpdate.length, 0);
        assert.deepStrictEqual(toCreate[0], providedTransaction);
    });

    it('the provided transaction differing by more than just the type, should be created (amount change)', () => {
        const providedTransaction = { ...A, amount: A.amount + 1 };
        const { toUpdate, toCreate } = filterDuplicateTransactions([
            [knownTransaction, providedTransaction],
        ]);
        assert.strictEqual(toCreate.length, 1);
        assert.strictEqual(toUpdate.length, 0);
        assert.deepStrictEqual(toCreate[0], providedTransaction);
    });

    it('the provided transaction differing by the type (other than card type change), and the known transaction was not modified by the user, should be created', () => {
        const knownTransaction2 = { ...knownTransaction, type: 'a_type', isUserDefinedType: false };
        const providedTransaction = { ...A, type: 'another_type' };
        const { toUpdate, toCreate } = filterDuplicateTransactions([
            [knownTransaction2, providedTransaction],
        ]);
        assert.strictEqual(toCreate.length, 1);
        assert.strictEqual(toUpdate.length, 0);
        assert.deepStrictEqual(toCreate[0], providedTransaction);
    });

    it('the provided transaction differing by the type (other than card type change), and the known transaction with a known type was modified by the user, the pair should be ignored', () => {
        const knownTransaction2 = { ...knownTransaction, type: 'a_type', isUserDefinedType: true };
        const providedTransaction = { ...A, type: 'another_type' };
        const { toUpdate, toCreate } = filterDuplicateTransactions([
            [knownTransaction2, providedTransaction],
        ]);
        assert.strictEqual(toCreate.length, 0);
        assert.strictEqual(toUpdate.length, 0);
    });

    it('the provided transaction differing by the type (other than card type change), and the known transaction was with an unknown type modified by the user, the type should be updated.', () => {
        const knownTransaction2 = {
            ...knownTransaction,
            type: UNKNOWN_TRANSACTION_TYPE,
            isUserDefinedType: true,
        };
        const providedTransaction = { ...A, type: 'a_known_type' };
        const { toUpdate, toCreate } = filterDuplicateTransactions([
            [knownTransaction2, providedTransaction],
        ]);
        assert.strictEqual(toCreate.length, 0);
        assert.strictEqual(toUpdate.length, 1);

        assert.deepStrictEqual(toUpdate[0].known, knownTransaction2);
        assert.deepStrictEqual(toUpdate[0].update, { type: providedTransaction.type });
    });

    it('the provided transaction changing the type from DEFERRED_CARD_TYPE to TRANSACTION_CARD_TYPE, but with no debitDate should be created', () => {
        const knownTransaction2 = { ...knownTransaction, type: DEFERRED_CARD_TYPE.name };
        const providedTransaction = { ...A, type: TRANSACTION_CARD_TYPE.name };
        const { toUpdate, toCreate } = filterDuplicateTransactions([
            [knownTransaction2, providedTransaction],
        ]);

        assert.strictEqual(toCreate.length, 1);
        assert.strictEqual(toUpdate.length, 0);
        assert.deepStrictEqual(toCreate[0], providedTransaction);
    });

    it('the provided transaction changing the type from DEFERRED_CARD_TYPE to TRANSACTION_CARD_TYPE, should be created, if the debitDate is after now', () => {
        const knownTransaction2 = {
            ...knownTransaction,
            type: DEFERRED_CARD_TYPE.name,
            debitDate: moment().add(1, 'day'),
        };
        const providedTransaction = { ...A, type: TRANSACTION_CARD_TYPE.name };
        const { toUpdate, toCreate } = filterDuplicateTransactions([
            [knownTransaction2, providedTransaction],
        ]);

        assert.strictEqual(toCreate.length, 1);
        assert.strictEqual(toUpdate.length, 0);
        assert.deepStrictEqual(toCreate[0], providedTransaction);
    });

    it('the provided transaction changing the type from DEFERRED_CARD_TYPE to TRANSACTION_CARD_TYPE, should be updated, if the debitDate is before now', () => {
        const knownTransaction2 = {
            ...knownTransaction,
            type: DEFERRED_CARD_TYPE.name,
            debitDate: moment().subtract(1, 'day'),
            isUserDefinedType: false,
        };
        const providedTransaction = { ...A, type: TRANSACTION_CARD_TYPE.name };
        const { toUpdate, toCreate } = filterDuplicateTransactions([
            [knownTransaction2, providedTransaction],
        ]);

        assert.strictEqual(toCreate.length, 0);
        assert.strictEqual(toUpdate.length, 1);

        assert.ok('known' in toUpdate[0]);
        assert.strictEqual(toUpdate[0].known.id, transactionId);
        assert.ok('update' in toUpdate[0]);
        assert.deepStrictEqual(toUpdate[0].update, { type: TRANSACTION_CARD_TYPE.name });
    });

    it('the provided transaction changing the type from DEFERRED_CARD_TYPE to TRANSACTION_CARD_TYPE, should be updated, if the debitDate is before now, even if the known transaction has isUserDefinedType === true', () => {
        const knownTransaction2 = {
            ...knownTransaction,
            type: DEFERRED_CARD_TYPE.name,
            debitDate: moment().subtract(1, 'day'),
            isUserDefinedType: true,
        };
        const providedTransaction = { ...A, type: TRANSACTION_CARD_TYPE.name };
        const { toUpdate, toCreate } = filterDuplicateTransactions([
            [knownTransaction2, providedTransaction],
        ]);

        assert.strictEqual(toCreate.length, 0);
        assert.strictEqual(toUpdate.length, 1);

        assert.ok('known' in toUpdate[0]);
        assert.strictEqual(toUpdate[0].known.id, transactionId);
        assert.ok('update' in toUpdate[0]);
        assert.deepStrictEqual(toUpdate[0].update, { type: TRANSACTION_CARD_TYPE.name });
    });

    it('the known transaction has type INTERNAL_TRANSFER_TYPE, the transaction should be ignored', () => {
        const knownTransaction2 = {
            ...knownTransaction,
            type: INTERNAL_TRANSFER_TYPE.name,
            isUserDefinedType: true,
        };
        const providedTransaction = knownTransaction;
        const { toUpdate, toCreate } = filterDuplicateTransactions([
            [knownTransaction2, providedTransaction],
        ]);

        assert.strictEqual(toCreate.length, 0);
        assert.strictEqual(toUpdate.length, 0);
    });

    it('the known transaction has a type but not the provided one, and it is a perfect match, the transaction should be ignored', () => {
        const withType = {
            ...knownTransaction,
            type: TRANSACTION_CARD_TYPE.name,
        };
        const withoutType = knownTransaction;
        const { toUpdate, toCreate } = filterDuplicateTransactions([[withType, withoutType]]);

        assert.strictEqual(toCreate.length, 0);
        assert.strictEqual(toUpdate.length, 0);
    });

    it('the createdByUser flag should be reset to false if either the known or provided transaction has it set to false', () => {
        const knownTransaction2 = {
            ...knownTransaction,
            debitDate: moment().subtract(1, 'day'),
            createdByUser: true,
        };
        const providedTransaction = {
            ...A,
            createdByUser: false,
        };
        const { toUpdate, toCreate } = filterDuplicateTransactions([
            [knownTransaction2, providedTransaction],
        ]);

        assert.strictEqual(toCreate.length, 0);
        assert.strictEqual(toUpdate.length, 1);
        assert.ok('known' in toUpdate[0]);
        assert.strictEqual(toUpdate[0].known.id, transactionId);
        assert.ok('update' in toUpdate[0]);
        assert.strictEqual(toUpdate[0].update.createdByUser, false);
    });

    it('the createdByUser flag should not be set to false if both the known and provided transactions have it set to true', () => {
        const knownTransaction2 = {
            ...knownTransaction,
            debitDate: moment().subtract(1, 'day'),
            createdByUser: true,
        };
        const providedTransaction = {
            ...A,
            createdByUser: true,
        };
        const { toUpdate } = filterDuplicateTransactions([
            [knownTransaction2, providedTransaction],
        ]);
        assert.strictEqual(toUpdate.length, 0);
    });

    it('the isRecurrentTransaction flag should be reset to false if either the known or provided transaction has it set to false', () => {
        const knownTransaction2 = {
            ...knownTransaction,
            debitDate: moment().subtract(1, 'day'),
            isRecurrentTransaction: true,
        };
        const providedTransaction = {
            ...A,
            isRecurrentTransaction: false,
        };
        const { toUpdate, toCreate } = filterDuplicateTransactions([
            [knownTransaction2, providedTransaction],
        ]);

        assert.strictEqual(toCreate.length, 0);
        assert.strictEqual(toUpdate.length, 1);

        assert.ok('known' in toUpdate[0]);
        assert.strictEqual(toUpdate[0].known.id, transactionId);
        assert.ok('update' in toUpdate[0]);
        assert.strictEqual(toUpdate[0].update.isRecurrentTransaction, false);
    });

    it('the isRecurrentTransaction flag should not be set to false if both the known and provided transactions have it set to true', () => {
        const knownTransaction2 = {
            ...knownTransaction,
            debitDate: moment().subtract(1, 'day'),
            isRecurrentTransaction: true,
        };
        const providedTransaction = {
            ...A,
            isRecurrentTransaction: true,
        };
        const { toUpdate } = filterDuplicateTransactions([
            [knownTransaction2, providedTransaction],
        ]);
        assert.strictEqual(toUpdate.length, 0);
    });
});
