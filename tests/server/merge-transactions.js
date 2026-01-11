import assert from 'node:assert';

import { mergeWith } from '../../server/models/helpers';
import { UNKNOWN_TRANSACTION_TYPE } from '../../server/helpers';

describe('Merging two transactions together', () => {
    let target = {
        accountId: 1234,
        categoryId: 42,
        type: '1',
        label: 'A pony',
        rawLabel: 'A pony bought at Horse Exchange',
        customLabel: 'My little pony',
        date: Date.parse('2018-12-31'),
        importDate: Date.parse('2019-01-18'),
        budgetDate: Date.parse('2019-01-01'),
        debitDate: Date.parse('2019-01-21'),
        amount: 1337.42,
        createdByUser: false,
    };

    let someDate = Date.parse('1998-07-14');

    it("should replace the importDate only when it's set", () => {
        let update = mergeWith(target, {
            importDate: someDate,
        });
        assert.strictEqual(update.importDate, someDate);

        update = mergeWith(target, {
            importDate: null,
        });
        assert.ok(!('importDate' in update));

        update = mergeWith(target, {
            customLabel: '13',
        });
        assert.ok(!('importDate' in update));
    });

    it("should replace the categoryId only when it's not set in the target", () => {
        let update = mergeWith(target, {
            categoryId: 45,
        });
        assert.ok(!('categoryId' in update));

        update = mergeWith(target, {
            categoryId: null,
        });
        assert.ok(!('categoryId' in update));

        let copy = Object.assign({}, target, { categoryId: null });

        update = mergeWith(copy, {
            categoryId: 10,
        });
        assert.strictEqual(update.categoryId, 10);

        update = mergeWith(copy, {
            categoryId: null,
        });
        assert.ok(!('categoryId' in update));
    });

    it("should replace the type only when it's not set in the target", () => {
        let update = mergeWith(target, {
            type: '1',
        });
        assert.ok(!('type' in update));

        update = mergeWith(target, {
            type: UNKNOWN_TRANSACTION_TYPE,
        });
        assert.ok(!('type' in update));

        let copy = Object.assign({}, target, { type: UNKNOWN_TRANSACTION_TYPE });

        update = mergeWith(copy, {
            type: '1',
        });
        assert.strictEqual(update.type, '1');

        update = mergeWith(copy, {
            type: UNKNOWN_TRANSACTION_TYPE,
        });
        assert.ok(!('type' in update));
    });

    it("should replace the custom label only when it's not set in the target", () => {
        let update = mergeWith(target, {
            customLabel: 'horsejs',
        });
        assert.ok(!('customLabel' in update));

        update = mergeWith(target, {
            customLabel: null,
        });
        assert.ok(!('customLabel' in update));

        let copy = Object.assign({}, target, { customLabel: null });

        update = mergeWith(copy, {
            customLabel: 'horsejs',
        });
        assert.strictEqual(update.customLabel, 'horsejs');

        update = mergeWith(copy, {
            customLabel: null,
        });
        assert.ok(!('customLabel' in update));

        update = mergeWith(copy, {
            label: 'poneyjs',
            createdByUser: true,
        });
        assert.strictEqual(update.customLabel, 'poneyjs');

        update = mergeWith(copy, {
            label: 'poneyjs',
            createdByUser: false,
        });
        assert.ok(!('customLabel' in update));
    });

    it("should replace the budget date only when it's not set in the target", () => {
        let update = mergeWith(target, {
            budgetDate: someDate,
        });
        assert.ok(!('budgetDate' in update));

        update = mergeWith(target, {
            budgetDate: null,
        });
        assert.ok(!('budgetDate' in update));

        let copy = Object.assign({}, target, { budgetDate: null });

        update = mergeWith(copy, {
            budgetDate: someDate,
        });
        assert.strictEqual(update.budgetDate, someDate);

        update = mergeWith(copy, {
            budgetDate: null,
        });
        assert.ok(!('budgetDate' in update));
    });

    it("should replace the debit date only when it's not set in the target", () => {
        let update = mergeWith(target, {
            debitDate: someDate,
        });
        assert.ok(!('debitDate' in update));

        update = mergeWith(target, {
            debitDate: null,
        });
        assert.ok(!('debitDate' in update));

        let copy = Object.assign({}, target, { debitDate: null });

        update = mergeWith(copy, {
            debitDate: someDate,
        });
        assert.strictEqual(update.debitDate, someDate);

        update = mergeWith(copy, {
            debitDate: null,
        });
        assert.ok(!('debitDate' in update));
    });

    it('should merge several fields at once', () => {
        let copy = Object.assign({}, target, {
            categoryId: null,
            customLabel: null,
        });

        let update = mergeWith(copy, {
            importDate: someDate,
            categoryId: 14,
        });

        assert.deepStrictEqual(update, {
            importDate: someDate,
            categoryId: 14,
        });
    });

    it('should set the updated transaction as not created by user if the second is not', () => {
        const copy = Object.assign({}, target, {
            createdByUser: true,
        });
        assert.strictEqual(copy.createdByUser, true);

        const update = mergeWith(copy, {
            createdByUser: false,
        });
        assert.strictEqual(update.createdByUser, false);
    });
});
