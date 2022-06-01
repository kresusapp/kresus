import should from 'should';

import { endOfMonth } from '../../shared/helpers/dates';

describe('shared helpers', () => {
    describe('endOfMonth', () => {
        it('should set the right day & month', () => {
            let d = endOfMonth(new Date('2022-06-15'));
            d.getDate().should.equal(30);
            d.getMonth().should.equal(5);

            // Make sure it does not set the month to march due
            // to 29th february not existing in 2022.
            d = endOfMonth(new Date('2022-01-29'));
            d.getMonth().should.equal(0);
            d.getDate().should.equal(31);

            // Same here: there is no 31st june.
            d = endOfMonth(new Date('2022-05-31'));
            d.getDate().should.equal(31);
            d.getMonth().should.equal(4);

            // Leap years should still be OK.
            d = endOfMonth(new Date('2020-02-29'));
            d.getMonth().should.equal(1);
            d.getDate().should.equal(29);
        });
    });
});
