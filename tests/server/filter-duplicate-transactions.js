import should from 'should';
import {
    UNKNOWN_OPERATION_TYPE,
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
        type: UNKNOWN_OPERATION_TYPE,
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
        toCreate.length.should.equal(0);
        toUpdate.length.should.equal(1);
        should.exist(toUpdate[0].known);
        toUpdate[0].known.id.should.equal(transactionId);
        toUpdate.length.should.equal(1);
        should.deepEqual(toUpdate[0].update, { type: updatedType });
    });

    it('the provided transaction differing by more than just the type, should be created (rawLabel change)', () => {
        const providedTransaction = { ...A, rawLabel: 'Another raw label' };
        const { toUpdate, toCreate } = filterDuplicateTransactions([
            [knownTransaction, providedTransaction],
        ]);
        toUpdate.length.should.equal(0);
        toCreate.length.should.equal(1);
        should.deepEqual(toCreate[0], providedTransaction);
    });

    it('the provided transaction differing by more than just the type, should be created (date change)', () => {
        const providedTransaction = { ...A, date: new Date('1987-04-02') };
        const { toUpdate, toCreate } = filterDuplicateTransactions([
            [knownTransaction, providedTransaction],
        ]);
        toUpdate.length.should.equal(0);
        toCreate.length.should.equal(1);
        should.deepEqual(toCreate[0], providedTransaction);
    });

    it('the provided transaction differing by more than just the type, should be created (amount change)', () => {
        const providedTransaction = { ...A, amount: A.amount + 1 };
        const { toUpdate, toCreate } = filterDuplicateTransactions([
            [knownTransaction, providedTransaction],
        ]);
        toUpdate.length.should.equal(0);
        toCreate.length.should.equal(1);
        toCreate[0].should.deepEqual(providedTransaction);
    });

    it('the provided transaction differing by the type (other than card type change), and the known transaction was not modified by the user, should be created', () => {
        const knownTransaction2 = { ...knownTransaction, type: 'a_type', isUserDefinedType: false };
        const providedTransaction = { ...A, type: 'another_type' };
        const { toUpdate, toCreate } = filterDuplicateTransactions([
            [knownTransaction2, providedTransaction],
        ]);
        toUpdate.length.should.equal(0);
        toCreate.length.should.equal(1);
        toCreate[0].should.deepEqual(providedTransaction);
    });

    it('the provided transaction differing by the type (other than card type change), and the known transaction with a known type was modified by the user, the pair should be ignored', () => {
        const knownTransaction2 = { ...knownTransaction, type: 'a_type', isUserDefinedType: true };
        const providedTransaction = { ...A, type: 'another_type' };
        const { toUpdate, toCreate } = filterDuplicateTransactions([
            [knownTransaction2, providedTransaction],
        ]);
        toUpdate.length.should.equal(0);
        toCreate.length.should.equal(0);
    });

    it('the provided transaction differing by the type (other than card type change), and the known transaction was with an unknown type modified by the user, the type shoud be updated.', () => {
        const knownTransaction2 = {
            ...knownTransaction,
            type: UNKNOWN_OPERATION_TYPE,
            isUserDefinedType: true,
        };
        const providedTransaction = { ...A, type: 'a_known_type' };
        const { toUpdate, toCreate } = filterDuplicateTransactions([
            [knownTransaction2, providedTransaction],
        ]);
        toCreate.length.should.equal(0);
        toUpdate.length.should.equal(1);
        toUpdate[0].known.should.deepEqual(knownTransaction2);
        toUpdate[0].update.should.deepEqual({ type: providedTransaction.type });
    });

    it('the provided transaction changing the type from DEFERRED_CARD_TYPE to TRANSACTION_CARD_TYPE, but with no debitDate should be created', () => {
        const knownTransaction2 = { ...knownTransaction, type: DEFERRED_CARD_TYPE.name };
        const providedTransaction = { ...A, type: TRANSACTION_CARD_TYPE.name };
        const { toUpdate, toCreate } = filterDuplicateTransactions([
            [knownTransaction2, providedTransaction],
        ]);
        toUpdate.length.should.equal(0);
        toCreate.length.should.equal(1);
        toCreate[0].should.deepEqual(providedTransaction);
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
        toUpdate.length.should.equal(0);
        toCreate.length.should.equal(1);
        toCreate[0].should.deepEqual(providedTransaction);
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
        toCreate.length.should.equal(0);
        toUpdate.length.should.equal(1);
        should.exist(toUpdate[0].known);
        toUpdate[0].known.id.should.equal(transactionId);
        toUpdate.length.should.equal(1);
        toUpdate[0].update.should.deepEqual({ type: TRANSACTION_CARD_TYPE.name });
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
        toCreate.length.should.equal(0);
        toUpdate.length.should.equal(1);
        should.exist(toUpdate[0].known);
        toUpdate[0].known.id.should.equal(transactionId);
        toUpdate.length.should.equal(1);
        toUpdate[0].update.should.deepEqual({ type: TRANSACTION_CARD_TYPE.name });
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
        toCreate.length.should.equal(0);
        toUpdate.length.should.equal(0);
    });
});
