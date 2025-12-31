import should from 'should';

import { getDuplicatePairScore } from '../../server/lib/duplicates-manager';
import {
    UNKNOWN_TRANSACTION_TYPE,
    INTERNAL_TRANSFER_TYPE,
    TRANSACTION_CARD_TYPE,
    NONE_CATEGORY_ID,
} from '../../server/helpers';

describe('getDuplicatePairScore', () => {
    const BaseTrancation = {
        rawLabel: 'A raw label',
        amount: 10,
        type: UNKNOWN_TRANSACTION_TYPE,
        date: new Date('1987-01-04'),
        categoryId: 1,
    };

    it('should return 0 for transactions with different amounts', () => {
        const comparison = {
            ...BaseTrancation,
            amount: 20,
        };

        const score = getDuplicatePairScore(comparison, BaseTrancation, 1, false);
        score.should.equal(0);
    });

    it('should return 0 for transactions with a date gap superior to the threshold', () => {
        const comparison = {
            ...BaseTrancation,
            date: new Date('1987-02-04'),
        };

        const score = getDuplicatePairScore(comparison, BaseTrancation, 1, false);
        score.should.equal(0);
    });

    it('should return 0 for transactions with everything similar but different category and ignoreDuplicatesWithDifferentCustomFields flag enabled', () => {
        const comparison = {
            ...BaseTrancation,
            categoryId: 2,
        };

        const score = getDuplicatePairScore(comparison, BaseTrancation, 1, true);
        score.should.equal(0);
    });

    it('should return 1 for transactions with everything similar and one unkwnown category and ignoreDuplicatesWithDifferentCustomFields flag enabled', () => {
        const comparison = {
            ...BaseTrancation,
            categoryId: NONE_CATEGORY_ID,
        };

        const score = getDuplicatePairScore(comparison, BaseTrancation, 1, true);
        score.should.equal(1);
    });

    it('should return 1 for transactions with everything similar and one unkwnown category (as null) and ignoreDuplicatesWithDifferentCustomFields flag enabled', () => {
        const comparison = {
            ...BaseTrancation,
            categoryId: null,
        };

        const score = getDuplicatePairScore(comparison, BaseTrancation, 1, true);
        score.should.equal(1);
    });

    it('should return 0 for transactions with everything similar but different type and ignoreDuplicatesWithDifferentCustomFields flag enabled', () => {
        const BaseWithType = {
            ...BaseTrancation,
            type: TRANSACTION_CARD_TYPE,
        };

        const comparison = {
            ...BaseTrancation,
            type: INTERNAL_TRANSFER_TYPE,
        };

        const score = getDuplicatePairScore(comparison, BaseWithType, 1, true);
        score.should.equal(0);
    });

    it('should return 1 for transactions with everything similar and one unkwown type and ignoreDuplicatesWithDifferentCustomFields flag enabled', () => {
        const comparison = {
            ...BaseTrancation,
            type: UNKNOWN_TRANSACTION_TYPE,
        };

        const score = getDuplicatePairScore(comparison, BaseTrancation, 1, true);
        score.should.equal(1);
    });

    it('should return 0 for transactions with everything similar but different custom label and ignoreDuplicatesWithDifferentCustomFields flag enabled', () => {
        const BaseWithCustomLabel = {
            ...BaseTrancation,
            customLabel: 'A custom label',
        };

        const comparison = {
            ...BaseTrancation,
            customLabel: 'Another custom label',
        };

        const score = getDuplicatePairScore(comparison, BaseWithCustomLabel, 1, true);
        score.should.equal(0);
    });

    it('should return non-zero for transactions with everything similar but a date gap inferior to the threshold', () => {
        const comparison = {
            ...BaseTrancation,
            date: new Date('1987-01-05'),
        };

        const score = getDuplicatePairScore(comparison, BaseTrancation, 2, false);
        score.should.be.above(0);
    });
});
