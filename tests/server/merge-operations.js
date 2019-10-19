import should from 'should';

import { mergeWith } from '../../server/models/pouch/helpers';
import { UNKNOWN_OPERATION_TYPE } from '../../server/helpers';

describe('Merging two transactions together', () => {
    let target = {
        accountId: '1234',
        categoryId: '42',
        type: '1',
        label: 'A pony',
        rawLabel: 'A pony bought at Horse Exchange',
        customLabel: 'My little pony',
        date: Date.parse('2018-12-31'),
        importDate: Date.parse('2019-01-18'),
        budgetDate: Date.parse('2019-01-01'),
        debitDate: Date.parse('2019-01-21'),
        amount: 1337.42,
        createdByUser: false
    };

    let someDate = Date.parse('1998-07-14');

    it("should replace the importDate only when it's set", () => {
        let update = mergeWith(target, {
            importDate: someDate
        });
        update.importDate.should.equal(someDate);

        update = mergeWith(target, {
            importDate: null
        });
        should.not.exist(update.importDate);

        update = mergeWith(target, {
            customLabel: '13'
        });
        should.not.exist(update.importDate);
    });

    it("should replace the categoryId only when it's not set in the target", () => {
        let update = mergeWith(target, {
            categoryId: 'abcd'
        });
        should.not.exist(update.categoryId);

        update = mergeWith(target, {
            categoryId: null
        });
        should.not.exist(update.categoryId);

        let copy = Object.assign({}, target, { categoryId: null });

        update = mergeWith(copy, {
            categoryId: 'abcd'
        });
        update.categoryId.should.equal('abcd');

        update = mergeWith(copy, {
            categoryId: null
        });
        should.not.exist(update.categoryId);
    });

    it("should replace the type only when it's not set in the target", () => {
        let update = mergeWith(target, {
            type: '1'
        });
        should.not.exist(update.type);

        update = mergeWith(target, {
            type: UNKNOWN_OPERATION_TYPE
        });
        should.not.exist(update.type);

        let copy = Object.assign({}, target, { type: UNKNOWN_OPERATION_TYPE });

        update = mergeWith(copy, {
            type: '1'
        });
        update.type.should.equal('1');

        update = mergeWith(copy, {
            type: UNKNOWN_OPERATION_TYPE
        });
        should.not.exist(update.type);
    });

    it("should replace the custom label only when it's not set in the target", () => {
        let update = mergeWith(target, {
            customLabel: 'horsejs'
        });
        should.not.exist(update.customLabel);

        update = mergeWith(target, {
            customLabel: null
        });
        should.not.exist(update.customLabel);

        let copy = Object.assign({}, target, { customLabel: null });

        update = mergeWith(copy, {
            customLabel: 'horsejs'
        });
        update.customLabel.should.equal('horsejs');

        update = mergeWith(copy, {
            customLabel: null
        });
        should.not.exist(update.customLabel);
    });

    it("should replace the budget date only when it's not set in the target", () => {
        let update = mergeWith(target, {
            budgetDate: someDate
        });
        should.not.exist(update.budgetDate);

        update = mergeWith(target, {
            budgetDate: null
        });
        should.not.exist(update.budgetDate);

        let copy = Object.assign({}, target, { budgetDate: null });

        update = mergeWith(copy, {
            budgetDate: someDate
        });
        update.budgetDate.should.equal(someDate);

        update = mergeWith(copy, {
            budgetDate: null
        });
        should.not.exist(update.budgetDate);
    });

    it("should replace the debit date only when it's not set in the target", () => {
        let update = mergeWith(target, {
            debitDate: someDate
        });
        should.not.exist(update.debitDate);

        update = mergeWith(target, {
            debitDate: null
        });
        should.not.exist(update.debitDate);

        let copy = Object.assign({}, target, { debitDate: null });

        update = mergeWith(copy, {
            debitDate: someDate
        });
        update.debitDate.should.equal(someDate);

        update = mergeWith(copy, {
            debitDate: null
        });
        should.not.exist(update.debitDate);
    });

    it('should merge several fields at once', () => {
        let copy = Object.assign({}, target, {
            categoryId: null,
            customLabel: null
        });

        let update = mergeWith(copy, {
            importDate: someDate,
            categoryId: 'trololo'
        });

        update.should.deepEqual({
            importDate: someDate,
            categoryId: 'trololo'
        });
    });
});
