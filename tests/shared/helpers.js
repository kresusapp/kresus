import assert from 'node:assert';

import { endOfMonth } from '../../shared/helpers/dates';

describe('shared helpers', () => {
    describe('endOfMonth', () => {
        it('should set the right day & month', () => {
            let d = endOfMonth(new Date('2022-06-15'));
            assert.strictEqual(d.getDate(), 30);
            assert.strictEqual(d.getMonth(), 5);

            // Make sure it does not set the month to march due
            // to 29th february not existing in 2022.
            d = endOfMonth(new Date('2022-01-29'));
            assert.strictEqual(d.getMonth(), 0);
            assert.strictEqual(d.getDate(), 31);

            // Same here: there is no 31st june.
            d = endOfMonth(new Date('2022-05-31'));
            assert.strictEqual(d.getDate(), 31);
            assert.strictEqual(d.getMonth(), 4);

            // Leap years should still be OK.
            d = endOfMonth(new Date('2020-02-29'));
            assert.strictEqual(d.getMonth(), 1);
            assert.strictEqual(d.getDate(), 29);
        });
    });
});
